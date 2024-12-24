import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from flask import Flask, request, jsonify, url_for, redirect, session
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
import json
from pathlib import Path
import requests
import time
import google.generativeai as genai
import mysql.connector
from mysql.connector import Error
from oauthlib.oauth2 import WebApplicationClient
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


class DatabaseConnection:
    def __init__(self):
        self.config = {
            'host': 'localhost',
            'user': 'gonna',
            'password': 'your_password',
            'database': 'ai_assistant'
        }
    
    def get_connection(self):
        try:
            connection = mysql.connector.connect(**self.config)
            return connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return None

class Analytics:
    def __init__(self):
        self.db = DatabaseConnection()

    @property
    def data(self):
        """Get all analytics data in the format expected by the API"""
        connection = self.db.get_connection()
        if not connection:
            return self._get_default_data()
        
        cursor = connection.cursor(dictionary=True)
        try:
            # Get total conversations
            cursor.execute("SELECT COUNT(*) as count FROM conversations")
            total_conversations = cursor.fetchone()['count']

            # Get daily conversations
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM conversations 
                WHERE DATE(timestamp) = CURDATE()
            """)
            daily_conversations = cursor.fetchone()['count']

            # Get total clients
            cursor.execute("SELECT COUNT(*) as count FROM clients")
            total_clients = cursor.fetchone()['count']

            # Get urgent cases
            cursor.execute("SELECT COUNT(*) as count FROM conversations WHERE is_urgent = TRUE")
            urgent_cases = cursor.fetchone()['count']

            # Get all conversations with details
            cursor.execute("""
                SELECT 
                    c.conversation_id,
                    cl.client_name,
                    c.timestamp,
                    c.user_input,
                    c.ai_response,
                    c.is_urgent,
                    cc.preferred_time,
                    cc.appointment_type,
                    cc.booking_in_progress
                FROM conversations c
                JOIN clients cl ON c.client_id = cl.client_id
                LEFT JOIN conversation_context cc ON c.conversation_id = cc.conversation_id
                ORDER BY c.timestamp DESC
            """)
            conversations = cursor.fetchall()

            # Get client data
            cursor.execute("""
                SELECT 
                    c.client_name,
                    c.first_interaction,
                    c.last_interaction,
                    c.total_conversations,
                    c.total_urgent_cases,
                    GROUP_CONCAT(DISTINCT cc.preferred_time) as preferred_times
                FROM clients c
                LEFT JOIN conversations conv ON c.client_id = conv.client_id
                LEFT JOIN conversation_context cc ON conv.conversation_id = cc.conversation_id
                GROUP BY c.client_id
            """)
            client_data = {row['client_name']: {
                'total_conversations': row['total_conversations'],
                'first_interaction': row['first_interaction'].isoformat() if row['first_interaction'] else None,
                'last_interaction': row['last_interaction'].isoformat() if row['last_interaction'] else None,
                'total_urgent_cases': row['total_urgent_cases'],
                'preferred_times': row['preferred_times'].split(',') if row['preferred_times'] else [],
                'conversation_history': []
            } for row in cursor.fetchall()}

            # Fill in conversation history for each client
            for conv in conversations:
                client_name = conv['client_name']
                if client_name in client_data:
                    client_data[client_name]['conversation_history'].append({
                        'timestamp': conv['timestamp'].isoformat(),
                        'conversation_data': {
                            'user_input': conv['user_input'],
                            'ai_response': conv['ai_response'],
                            'context': {
                                'preferred_time': conv['preferred_time'],
                                'appointment_type': conv['appointment_type'],
                                'booking_in_progress': conv['booking_in_progress'],
                                'is_urgent': conv['is_urgent']
                            }
                        }
                    })

            return {
                'total_conversations': total_conversations,
                'daily_conversations': daily_conversations,
                'total_clients': total_clients,
                'urgent_cases': urgent_cases,
                'conversations': [{
                    'timestamp': conv['timestamp'].isoformat(),
                    'client_name': conv['client_name'],
                    'conversation_data': {
                        'user_input': conv['user_input'],
                        'ai_response': conv['ai_response'],
                        'context': {
                            'preferred_time': conv['preferred_time'],
                            'appointment_type': conv['appointment_type'],
                            'booking_in_progress': conv['booking_in_progress'],
                            'is_urgent': conv['is_urgent']
                        }
                    }
                } for conv in conversations],
                'client_data': client_data,
                'last_reset': datetime.now().strftime("%Y-%m-%d")
            }
        except Error as e:
            print(f"Error fetching analytics data: {e}")
            return self._get_default_data()
        finally:
            cursor.close()
            connection.close()

    def _get_default_data(self):
        """Return default data structure when database is unavailable"""
        return {
            'total_conversations': 0,
            'daily_conversations': 0,
            'total_clients': 0,
            'urgent_cases': 0,
            'conversations': [],
            'client_data': {},
            'last_reset': datetime.now().strftime("%Y-%m-%d")
        }

    def _daily_reset(self):
        """Reset daily counters if needed"""
        today = datetime.now().strftime("%Y-%m-%d")
        if 'last_reset' not in self.data or self.data['last_reset'] != today:
            self.data['daily_conversations'] = 0
            self.data['last_reset'] = today
            self.save_analytics()

    def ensure_data_directory(self):
        os.makedirs("data", exist_ok=True)
        if not os.path.exists(self.analytics_file):
            self.save_analytics({
                "total_conversations": 0,
                "daily_conversations": 0,
                "total_clients": 0,
                "conversations": [],
                "client_data": {},
                "urgent_cases": 0,
                "last_reset": datetime.now().strftime("%Y-%m-%d")
            })

    def log_conversation(self, client_name, conversation_data):
        connection = self.db.get_connection()
        if not connection:
            return
        
        cursor = connection.cursor(dictionary=True)
        try:
            # Get or create client
            cursor.execute("""
                INSERT INTO clients (client_name, first_interaction, last_interaction)
                VALUES (%s, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                    last_interaction = NOW(),
                    total_conversations = total_conversations + 1
            """, (client_name,))
            
            if cursor.rowcount == 0:
                cursor.execute("SELECT client_id FROM clients WHERE client_name = %s", (client_name,))
            
            client_id = cursor.lastrowid or cursor.fetchone()['client_id']
            
            # Log conversation
            cursor.execute("""
                INSERT INTO conversations 
                (client_id, timestamp, user_input, ai_response, is_urgent, sentiment)
                VALUES (%s, NOW(), %s, %s, %s, %s)
            """, (
                client_id,
                conversation_data['user_input'],
                conversation_data['ai_response'],
                conversation_data['context'].get('is_urgent', False),
                self._analyze_sentiment(conversation_data['user_input'])
            ))
            
            conversation_id = cursor.lastrowid
            
            # Store context
            cursor.execute("""
                INSERT INTO conversation_context 
                (conversation_id, preferred_time, appointment_type, booking_in_progress)
                VALUES (%s, %s, %s, %s)
            """, (
                conversation_id,
                conversation_data['context'].get('preferred_time'),
                conversation_data['context'].get('appointment_type'),
                conversation_data['context'].get('booking_in_progress', False)
            ))
            
            # Update urgent cases count if needed
            if conversation_data['context'].get('is_urgent', False):
                cursor.execute("""
                    UPDATE clients 
                    SET total_urgent_cases = total_urgent_cases + 1 
                    WHERE client_id = %s
                """, (client_id,))
            
            connection.commit()
        except Error as e:
            print(f"Error logging conversation: {e}")
            connection.rollback()
        finally:
            cursor.close()
            connection.close()

    def _analyze_sentiment(self, text):
        """Basic sentiment analysis"""
        positive_words = ["thanks", "good", "great", "excellent", "happy", "appreciate"]
        negative_words = ["bad", "poor", "unhappy", "frustrated", "angry", "worst"]

        text = text.lower()
        pos_count = sum(1 for word in positive_words if word in text)
        neg_count = sum(1 for word in negative_words if word in text)

        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        return "neutral"

    def get_client_summary(self, client_name):
        connection = self.db.get_connection()
        if not connection:
            return None
        
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT c.*, 
                       COUNT(conv.conversation_id) as total_conversations,
                       c.first_interaction,
                       c.last_interaction,
                       c.total_urgent_cases
                FROM clients c
                LEFT JOIN conversations conv ON c.client_id = conv.client_id
                WHERE c.client_name = %s
                GROUP BY c.client_id
            """, (client_name,))
            
            return cursor.fetchone()
        finally:
            cursor.close()
            connection.close()

    def _analyze_preferred_times(self, times):
        """Analyze preferred appointment times"""
        if not times:
            return "No preference data"

        time_counts = {}
        for time in times:
            time_counts[time] = time_counts.get(time, 0) + 1

        return sorted(time_counts.items(), key=lambda x: x[1], reverse=True)[0][0]

    def _get_sentiment_summary(self, history):
        """Get overall sentiment summary"""
        sentiments = [conv.get('sentiment', 'neutral') for conv in history]
        pos_count = sentiments.count('positive')
        neg_count = sentiments.count('negative')
        neutral_count = sentiments.count('neutral')

        total = len(sentiments)
        if total == 0:
            return "No sentiment data"

        return {
            "positive_percentage": (pos_count/total) * 100,
            "negative_percentage": (neg_count/total) * 100,
            "neutral_percentage": (neutral_count/total) * 100
        }

    def load_analytics(self):
        try:
            with open(self.analytics_file, 'r') as file:
                self.data = json.load(file)
        except FileNotFoundError:
            self.data = {
                "total_conversations": 0,
                "total_clients": 0,
                "conversations": [],
                "client_data": {}
            }

    def save_analytics(self, data=None):
        if data is None:
            data = self.data
        with open(self.analytics_file, 'w') as file:
            json.dump(data, file, indent=4)

    def log_conversation(self, client_name, conversation_data):
        timestamp = datetime.now().isoformat()
        
        # Create a clean copy of conversation data
        clean_conversation = {
            "timestamp": timestamp,
            "client_name": client_name,
            "user_input": conversation_data["user_input"],
            "ai_response": conversation_data["ai_response"],
            "context": {
                k: v for k, v in conversation_data["context"].items()
                if not isinstance(v, (dict, list)) or k == "booking_in_progress"
            }
        }

        # Update conversation log
        self.data["conversations"].append(clean_conversation)

        # Update client data
        if client_name not in self.data["client_data"]:
            self.data["client_data"][client_name] = {
                "total_conversations": 0,
                "first_interaction": timestamp,
                "last_interaction": timestamp,
                "conversation_history": [],
                "total_urgent_cases": 0,
                "preferred_times": [],
                "common_requests": []
            }
            self.data["total_clients"] += 1

        client_data = self.data["client_data"][client_name]
        client_data["total_conversations"] += 1
        client_data["last_interaction"] = timestamp
        
        # Store conversation
        client_data["conversation_history"].append(clean_conversation)

        # Update daily stats
        self.data["daily_conversations"] += 1
        self.data["total_conversations"] += 1
        self.save_analytics()

class KnowledgeBase:
    def __init__(self):
        self.db = DatabaseConnection()
        self.kb_file = "data/knowledge_base.json"
        self.data = self.load_knowledge_base()
        self.ensure_kb_file()

    def ensure_kb_file(self):
        """Ensure knowledge base file exists with default structure"""
        os.makedirs(os.path.dirname(self.kb_file), exist_ok=True)
        if not os.path.exists(self.kb_file):
            default_kb = {
                "ai_name": "Alex",
                "tone_of_voice": "Professional",
                "response_style": "Moderate",
                "enable_follow_up": True,
                "custom_knowledge": {},
                "response_length": "Moderate"
            }
            with open(self.kb_file, 'w') as file:
                json.dump(default_kb, file, indent=4)

    def load_knowledge_base(self):
        """Load knowledge base from database, fallback to file if DB fails"""
        connection = self.db.get_connection()
        if not connection:
            return self._load_from_file()
        
        cursor = connection.cursor(dictionary=True)
        try:
            # Get settings
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_base_settings (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    ai_name VARCHAR(50) NOT NULL DEFAULT 'Alex',
                    tone_of_voice VARCHAR(50) NOT NULL DEFAULT 'Professional',
                    response_style VARCHAR(50) NOT NULL DEFAULT 'Moderate',
                    response_length VARCHAR(50) NOT NULL DEFAULT 'Moderate',
                    enable_follow_up BOOLEAN NOT NULL DEFAULT TRUE
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS custom_knowledge (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    category VARCHAR(100) NOT NULL UNIQUE,
                    content TEXT NOT NULL
                )
            """)
            
            # Insert default settings if none exist
            cursor.execute("""
                INSERT IGNORE INTO knowledge_base_settings (id, ai_name)
                VALUES (1, 'Alex')
            """)
            
            cursor.execute("SELECT * FROM knowledge_base_settings WHERE id = 1")
            settings = cursor.fetchone()
            
            # Get custom knowledge
            cursor.execute("SELECT category, content FROM custom_knowledge")
            custom_knowledge = {row['category']: row['content'] for row in cursor.fetchall()}
            
            connection.commit()
            
            return {
                'ai_name': settings['ai_name'],
                'tone_of_voice': settings['tone_of_voice'],
                'response_style': settings['response_style'],
                'response_length': settings['response_length'],
                'enable_follow_up': bool(settings['enable_follow_up']),
                'custom_knowledge': custom_knowledge
            }
        except Error as e:
            print(f"Database error: {e}")
            return self._load_from_file()
        finally:
            cursor.close()
            connection.close()

    def _load_from_file(self):
        """Load knowledge base from file"""
        try:
            with open(self.kb_file, 'r') as file:
                return json.load(file)
        except FileNotFoundError:
            return self._get_default_settings()

    def save_knowledge_base(self):
        """Save knowledge base to both database and file"""
        # Save to database
        connection = self.db.get_connection()
        if connection:
            cursor = connection.cursor()
            try:
                # Update settings
                cursor.execute("""
                    UPDATE knowledge_base_settings 
                    SET ai_name = %s,
                        tone_of_voice = %s,
                        response_style = %s,
                        response_length = %s,
                        enable_follow_up = %s
                    WHERE id = 1
                """, (
                    self.data['ai_name'],
                    self.data['tone_of_voice'],
                    self.data['response_style'],
                    self.data['response_length'],
                    self.data['enable_follow_up']
                ))
                
                connection.commit()
            except Error as e:
                print(f"Error saving to database: {e}")
            finally:
                cursor.close()
                connection.close()
        
        # Save to file as backup
        try:
            with open(self.kb_file, 'w') as file:
                json.dump(self.data, file, indent=4)
        except Exception as e:
            print(f"Error saving to file: {e}")

    def add_knowledge(self, category, content):
        """Add or update knowledge in both database and memory"""
        connection = self.db.get_connection()
        if connection:
            cursor = connection.cursor()
            try:
                cursor.execute("""
                    INSERT INTO custom_knowledge (category, content)
                    VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE content = VALUES(content)
                """, (category, content))
                
                connection.commit()
                
                # Update in-memory data
                self.data['custom_knowledge'][category] = content
                
                # Save to file as backup
                self.save_knowledge_base()
                
                return True
            except Error as e:
                print(f"Error adding knowledge: {e}")
                return False
            finally:
                cursor.close()
                connection.close()
        else:
            # Fallback to file-only storage if database is unavailable
            self.data['custom_knowledge'][category] = content
            self.save_knowledge_base()
            return True

    def _get_default_settings(self):
        """Return default settings"""
        return {
            'ai_name': 'Alex',
            'tone_of_voice': 'Professional',
            'response_style': 'Moderate',
            'response_length': 'Moderate',
            'enable_follow_up': True,
            'custom_knowledge': {}
        }

    def update_settings(self, settings):
        connection = self.db.get_connection()
        if not connection:
            return
        
        cursor = connection.cursor()
        try:
            update_query = """
                UPDATE knowledge_base_settings 
                SET ai_name = %s, 
                    tone_of_voice = %s,
                    response_style = %s,
                    response_length = %s,
                    enable_follow_up = %s
                WHERE id = 1
            """
            cursor.execute(update_query, (
                settings.get('ai_name', 'Alex'),
                settings.get('tone_of_voice', 'Professional'),
                settings.get('response_style', 'Moderate'),
                settings.get('response_length', 'Moderate'),
                settings.get('enable_follow_up', True)
            ))
            connection.commit()
            
            # Update the in-memory data
            self.data = self.load_knowledge_base()
        finally:
            cursor.close()
            connection.close()

class Schedule:
    def __init__(self):
        self.db = DatabaseConnection()
        self._initialize_schedule_tables()

    def _initialize_schedule_tables(self):
        """Initialize the necessary database tables for scheduling"""
        connection = self.db.get_connection()
        if not connection:
            return
        
        cursor = connection.cursor()
        try:
            # Create schedule table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS schedule (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    day_of_week VARCHAR(10) NOT NULL,
                    time_slot TIME NOT NULL,
                    status VARCHAR(20) DEFAULT 'available',
                    booked_by INT,
                    appointment_type VARCHAR(50),
                    FOREIGN KEY (booked_by) REFERENCES clients(client_id),
                    UNIQUE KEY unique_slot (day_of_week, time_slot)
                )
            """)
            
            # Check if we need to populate default schedule
            cursor.execute("SELECT COUNT(*) FROM schedule")
            if cursor.fetchone()[0] == 0:
                # Populate default schedule (Mon-Fri, 9 AM to 5 PM, hourly slots)
                days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                times = [f"{h:02d}:00:00" for h in range(9, 17)]  # 9 AM to 4 PM
                
                for day in days:
                    for time in times:
                        cursor.execute("""
                            INSERT IGNORE INTO schedule (day_of_week, time_slot, status)
                            VALUES (%s, %s, 'available')
                        """, (day, time))
            
            connection.commit()
        finally:
            cursor.close()
            connection.close()

    def _update_admin_schedule(self):
        for day, times in self.admin_schedule.items():
            for time in times:
                if time in self.weekly_schedule[day]:
                    self.weekly_schedule[day][time]['status'] = 'busy'
                    self.weekly_schedule[day][time]['booked_by'] = 'admin'
                    self.weekly_schedule[day][time]['type'] = 'admin meeting'

    def get_available_slots(self, day):
        connection = self.db.get_connection()
        if not connection:
            return []
        
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT 
                    DATE_FORMAT(time_slot, '%h:%i %p') as time
                FROM schedule
                WHERE day_of_week = %s
                AND status = 'available'
                ORDER BY time_slot
            """, (day.capitalize(),))
            
            return [row['time'] for row in cursor.fetchall()]
        finally:
            cursor.close()
            connection.close()

    def book_appointment(self, day, time, client_name, appointment_type):
        connection = self.db.get_connection()
        if not connection:
            return False
        
        cursor = connection.cursor()
        try:
            # First, make sure the client exists or create them
            cursor.execute("""
                INSERT IGNORE INTO clients (client_name, first_interaction)
                VALUES (%s, NOW())
            """, (client_name,))
            
            # Get client_id
            cursor.execute("""
                SELECT client_id FROM clients WHERE client_name = %s
            """, (client_name,))
            client_id = cursor.fetchone()[0]
            
            # Convert time format for comparison (e.g., "09:00 AM" to "09:00:00")
            time_obj = datetime.strptime(time, '%I:%M %p').time()
            time_24h = time_obj.strftime('%H:%M:%S')
            
            # Update schedule
            cursor.execute("""
                UPDATE schedule
                SET status = 'booked',
                    booked_by = %s,
                    appointment_type = %s
                WHERE day_of_week = %s
                AND time_slot = %s
                AND status = 'available'
            """, (client_id, appointment_type, day.capitalize(), time_24h))
            
            success = cursor.rowcount > 0
            if success:
                connection.commit()
            return success
            
        except Exception as e:
            print(f"Error booking appointment: {e}")
            connection.rollback()
            return False
        finally:
            cursor.close()
            connection.close()

class AIAssistant:
    def __init__(self):
        # Initialize components
        self.analytics = Analytics()
        self.knowledge_base = KnowledgeBase()
        self.schedule = Schedule()

        # API Keys
        self.google_api_key = "AIzaSyDKYbM7kwYQX5xXNxheWOjpzVzAh12sTDA"
        self.elevenlabs_api_key = "sk_d2a3556683942636ebb36b517e8369542866afe5bd914a51"

        # Initialize conversation context
        self.conversation_context = {
            'current_client': None,
            'appointment_type': None,
            'preferred_day': None,
            'preferred_time': None,
            'booking_in_progress': False,
            'conversation_history': []
        }

        # Configure Google AI
        genai.configure(api_key=self.google_api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def generate_personality_prompt(self):
        kb = self.knowledge_base.data
        prompt = f"""
        You are an intelligent and helpful AI assistant named {kb['ai_name']} with the following characteristics:

        1. Personality:
           - Tone: {kb['tone_of_voice']}
           - Response Length: {kb['response_length']}
           - Style: {kb['response_style']}

        2. Communication Approach:
           - {'Engages in follow-up questions' if kb['enable_follow_up'] else 'Provides complete responses without follow-ups'}
           - Maintains conversation context
           - Addresses clients by name when known

        3. Knowledge Base:
        """

        if kb.get('custom_knowledge'):
            prompt += "\nCustom Knowledge Areas:"
            for category, content in kb['custom_knowledge'].items():
                prompt += f"\n- {category}: {content}"

        prompt += """
        4. Capabilities:
           - Manages appointments and schedules
           - Provides information from knowledge base
           - Records analytics and conversation history
           - Adapts responses based on context and settings

        Current Context:
        - You have access to a weekly schedule
        - You can check admin availability
        - You can book appointments
        - You remember client preferences and history
        """

        return prompt

    def get_ai_response(self, user_input):
        try:
            # Ensure knowledge base data is loaded
            if not hasattr(self.knowledge_base, 'data') or self.knowledge_base.data is None:
                self.knowledge_base.data = self.knowledge_base.load_knowledge_base()

            current_context = f"""
            Current conversation context:
            - Client: {self.conversation_context['current_client']}
            - Appointment type: {self.conversation_context['appointment_type']}
            - Preferred day: {self.conversation_context['preferred_day']}
            - Preferred time: {self.conversation_context['preferred_time']}
            - Booking in progress: {self.conversation_context['booking_in_progress']}

            User input: {user_input}
            """

            full_prompt = f"{self.generate_personality_prompt()}\n\n{current_context}"
            response = self.model.generate_content(full_prompt)

            # Update context
            self._update_context_from_response(response.text, user_input)
            
            # Log conversation if there's a client
            if self.conversation_context['current_client']:
                self._log_conversation(user_input, response.text)

            return {
                'text': response.text,
                'context': {
                    'current_client': self.conversation_context['current_client'],
                    'appointment_type': self.conversation_context['appointment_type'],
                    'preferred_day': self.conversation_context['preferred_day'],
                    'preferred_time': self.conversation_context['preferred_time'],
                    'booking_in_progress': self.conversation_context['booking_in_progress']
                }
            }

        except Exception as e:
            print(f"Error in AI response generation: {e}")
            return {
                'text': "I apologize, but I encountered an error. How else can I assist you?",
                'context': {}
            }

    def _update_context_from_response(self, response, user_input):
        """Updates conversation context based on user input"""
        if "name is" in user_input.lower():
            name = user_input.lower().split("name is")[-1].strip()
            self.conversation_context['current_client'] = name

        appointment_types = ["meeting", "consultation", "appointment", "booking"]
        for apt_type in appointment_types:
            if apt_type in user_input.lower():
                self.conversation_context['appointment_type'] = apt_type

        days = ["monday", "tuesday", "wednesday", "thursday", "friday"]
        for day in days:
            if day in user_input.lower():
                self.conversation_context['preferred_day'] = day.capitalize()

        if ":" in user_input or "am" in user_input.lower() or "pm" in user_input.lower():
            self.conversation_context['preferred_time'] = user_input

    def _log_conversation(self, user_input, ai_response):
        """Logs the conversation to analytics"""
        conversation_data = {
            "timestamp": datetime.now().isoformat(),
            "user_input": user_input,
            "ai_response": ai_response,
            "context": {
                'current_client': self.conversation_context['current_client'],
                'appointment_type': self.conversation_context['appointment_type'],
                'preferred_day': self.conversation_context['preferred_day'],
                'preferred_time': self.conversation_context['preferred_time'],
                'booking_in_progress': self.conversation_context['booking_in_progress']
            }
        }

        self.conversation_context['conversation_history'].append(conversation_data)

        if self.conversation_context['current_client']:
            self.analytics.log_conversation(
                self.conversation_context['current_client'],
                conversation_data
            )

    def text_to_speech(self, text, output_file=None):
        """Convert text to speech using ElevenLabs API"""
        if output_file is None:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            output_file = f"output_audio/response_{timestamp}.mp3"

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.elevenlabs_api_key
        }

        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.75,
                "similarity_boost": 0.75
            }
        }

        try:
            response = requests.post(
                f"{self.tts_api_url}/{self.voice_id}",
                headers=headers,
                json=payload
            )

            if response.status_code == 200:
                with open(output_file, "wb") as file:
                    file.write(response.content)
                return True, output_file
            else:
                print(f"Error in text-to-speech conversion: {response.status_code}")
                print(f"Response content: {response.text}")
                return False, None

        except Exception as e:
            print(f"Exception in text-to-speech conversion: {e}")
            return False, None

    def chat_and_speak(self, user_input):
        """Complete pipeline: Get AI response and convert to speech"""
        # Get AI response
        response_data = self.get_ai_response(user_input)
        
        # Extract text from response
        text_response = response_data['text']
        
        # Convert to speech
        success, audio_file = self.text_to_speech(text_response)

        return {
            'text': text_response,
            'context': response_data['context'],
            'audio_file': audio_file if success else None
        }

class AdminPanel:
    def __init__(self, ai_assistant):
        self.ai_assistant = ai_assistant

    def display_menu(self):
        """Display admin panel menu"""
        print("\n=== Admin Panel ===")
        print("1. View Analytics")
        print("2. Manage Knowledge Base")
        print("3. Configure AI Settings")
        print("4. View Conversation History")
        print("5. Export Data")
        print("6. Exit Admin Panel")

    def run(self):
        """Run admin panel interface"""
        while True:
            self.display_menu()
            choice = input("\nEnter your choice (1-6): ")

            if choice == "1":
                self.view_analytics()
            elif choice == "2":
                self.manage_knowledge_base()
            elif choice == "3":
                self.configure_ai_settings()
            elif choice == "4":
                self.view_conversation_history()
            elif choice == "5":
                self.export_data()
            elif choice == "6":
                print("Exiting admin panel...")
                break
            else:
                print("Invalid choice. Please try again.")

    def view_analytics(self):
        """Display analytics dashboard"""
        analytics = self.ai_assistant.analytics.data
        print("\n=== Analytics Dashboard ===")
        print(f"Total Conversations: {analytics['total_conversations']}")
        print(f"Total Unique Clients: {analytics['total_clients']}")

        if analytics['client_data']:
            print("\nTop Active Clients:")
            sorted_clients = sorted(
                analytics['client_data'].items(),
                key=lambda x: x[1]['total_conversations'],
                reverse=True
            )[:5]

            for client, data in sorted_clients:
                print(f"\n{client}:")
                print(f"- Total Conversations: {data['total_conversations']}")
                print(f"- First Interaction: {data['first_interaction']}")
                print(f"- Last Interaction: {data['last_interaction']}")

    def manage_knowledge_base(self):
        """Manage knowledge base content"""
        while True:
            print("\n=== Knowledge Base Management ===")
            print("1. View Current Knowledge")
            print("2. Add New Knowledge")
            print("3. Edit Existing Knowledge")
            print("4. Return to Main Menu")

            choice = input("\nEnter your choice (1-4): ")

            if choice == "1":
                self._view_knowledge()
            elif choice == "2":
                self._add_knowledge()
            elif choice == "3":
                self._edit_knowledge()
            elif choice == "4":
                break
            else:
                print("Invalid choice. Please try again.")

    def _view_knowledge(self):
        """View current knowledge base content"""
        kb = self.ai_assistant.knowledge_base.data
        print("\n=== Current Knowledge Base ===")
        print(f"AI Name: {kb['ai_name']}")
        print(f"Tone of Voice: {kb['tone_of_voice']}")
        print(f"Response Style: {kb['response_style']}")
        print(f"Response Length: {kb['response_length']}")
        print(f"Enable Follow-up: {kb['enable_follow_up']}")

        if kb.get('custom_knowledge'):
            print("\nCustom Knowledge Areas:")
            for category, content in kb['custom_knowledge'].items():
                print(f"\n{category}:")
                print(content)

    def _add_knowledge(self):
        """Add new knowledge to the knowledge base"""
        category = input("\nEnter knowledge category: ")
        content = input("Enter knowledge content: ")
        self.ai_assistant.knowledge_base.add_knowledge(category, content)
        print("Knowledge added successfully!")

    def _edit_knowledge(self):
        """Edit existing knowledge"""
        kb = self.ai_assistant.knowledge_base.data
        if not kb.get('custom_knowledge'):
            print("No custom knowledge exists yet.")
            return

        print("\nExisting categories:")
        for i, category in enumerate(kb['custom_knowledge'].keys(), 1):
            print(f"{i}. {category}")

        try:
            choice = int(input("\nEnter category number to edit: ")) - 1
            categories = list(kb['custom_knowledge'].keys())
            category = categories[choice]

            print(f"\nCurrent content for {category}:")
            print(kb['custom_knowledge'][category])

            new_content = input("\nEnter new content (or press enter to keep current): ")
            if new_content:
                self.ai_assistant.knowledge_base.data['custom_knowledge'][category] = new_content
                self.ai_assistant.knowledge_base.save_knowledge_base()
                print("Knowledge updated successfully!")
        except (ValueError, IndexError):
            print("Invalid selection.")

    def configure_ai_settings(self):
        """Configure AI assistant settings"""
        print("\n=== AI Settings Configuration ===")

        settings = {}
        settings['ai_name'] = input("Enter AI Name (or press enter to keep current): ").strip()

        print("\nTone of Voice Options:")
        print("1. Professional")
        print("2. Friendly")
        print("3. Casual")
        print("4. Formal")
        tone_choice = input("Select tone (1-4 or press enter to keep current): ")
        if tone_choice:
            tones = ["Professional", "Friendly", "Casual", "Formal"]
            settings['tone_of_voice'] = tones[int(tone_choice) - 1]

        print("\nResponse Length Options:")
        print("1. Concise")
        print("2. Moderate")
        print("3. Detailed")
        length_choice = input("Select length (1-3 or press enter to keep current): ")
        if length_choice:
            lengths = ["Concise", "Moderate", "Detailed"]
            settings['response_length'] = lengths[int(length_choice) - 1]

        follow_up = input("\nEnable follow-up questions? (yes/no or press enter to keep current): ").lower()
        if follow_up in ['yes', 'no']:
            settings['enable_follow_up'] = follow_up == 'yes'

        # Update only provided settings
        settings = {k: v for k, v in settings.items() if v}
        if settings:
            self.ai_assistant.knowledge_base.update_settings(settings)
            print("\nSettings updated successfully!")

    def view_conversation_history(self):
        """View conversation history"""
        analytics = self.ai_assistant.analytics.data

        if not analytics['conversations']:
            print("\nNo conversation history available.")
            return

        print("\n=== Conversation History ===")
        print("1. View by Client")
        print("2. View Recent Conversations")
        print("3. Return to Main Menu")

        choice = input("\nEnter your choice (1-3): ")

        if choice == "1":
            self._view_by_client()
        elif choice == "2":
            self._view_recent_conversations()

    def _view_by_client(self):
        """View conversation history for a specific client"""
        analytics = self.ai_assistant.analytics.data
        clients = list(analytics['client_data'].keys())

        if not clients:
            print("\nNo client data available.")
            return

        print("\nAvailable clients:")
        for i, client in enumerate(clients, 1):
            print(f"{i}. {client}")

        try:
            choice = int(input("\nSelect client number: ")) - 1
            client = clients[choice]
            client_data = analytics['client_data'][client]

            print(f"\nConversation history for {client}:")
            for conv in client_data['conversation_history'][-5:]:  # Show last 5 conversations
                print(f"\nTimestamp: {conv['timestamp']}")
                print(f"User: {conv['conversation_data']['user_input']}")
                print(f"AI: {conv['conversation_data']['ai_response']}")
        except (ValueError, IndexError):
            print("Invalid selection.")

    def _view_recent_conversations(self):
        """View recent conversations across all clients"""
        analytics = self.ai_assistant.analytics.data
        conversations = analytics['conversations'][-10:]  # Show last 10 conversations

        print("\nRecent conversations:")
        for conv in conversations:
            print(f"\nTimestamp: {conv['timestamp']}")
            print(f"Client: {conv['client_name']}")
            print(f"User: {conv['conversation_data']['user_input']}")
            print(f"AI: {conv['conversation_data']['ai_response']}")

    def export_data(self):
        """Export analytics and knowledge base data"""
        print("\n=== Export Data ===")
        print("1. Export Analytics")
        print("2. Export Knowledge Base")
        print("3. Export All")
        print("4. Return to Main Menu")

        choice = input("\nEnter your choice (1-4): ")

        if choice == "1":
            self._export_analytics()
        elif choice == "2":
            self._export_knowledge_base()
        elif choice == "3":
            self._export_all()

    def _export_analytics(self):
        """Export analytics data to JSON file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"data/exports/analytics_export_{timestamp}.json"
        os.makedirs("data/exports", exist_ok=True)

        with open(filename, 'w') as file:
            json.dump(self.ai_assistant.analytics.data, file, indent=4)
        print(f"\nAnalytics exported to: {filename}")

    def _export_knowledge_base(self):
        """Export knowledge base to JSON file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"data/exports/knowledge_base_export_{timestamp}.json"
        os.makedirs("data/exports", exist_ok=True)

        with open(filename, 'w') as file:
            json.dump(self.ai_assistant.knowledge_base.data, file, indent=4)
        print(f"\nKnowledge base exported to: {filename}")

    def _export_all(self):
        """Export all data to JSON files"""
        self._export_analytics()
        self._export_knowledge_base()

class User(UserMixin):
    def __init__(self):
        self.db = DatabaseConnection()
        self.create_tables()

    def get(self, user_id):
        connection = self.db.get_connection()
        if not connection:
            return None
        
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT * FROM users WHERE id = %s
            """, (user_id,))
            user_data = cursor.fetchone()
            if user_data:
                self.id = user_data['id']
                self.email = user_data['email']
                return self
            return None
        finally:
            cursor.close()
            connection.close()

    def create_tables(self):
        connection = self.db.get_connection()
        if not connection:
            return
        
        cursor = connection.cursor()
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            connection.commit()
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def create(email, password):
        db = DatabaseConnection()
        connection = db.get_connection()
        if not connection:
            return None

        cursor = connection.cursor()
        try:
            cursor.execute("""
                INSERT INTO users (email, password, auth_type)
                VALUES (%s, %s, 'local')
            """, (email, generate_password_hash(password)))
            connection.commit()
            return cursor.lastrowid
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def get_by_email(email):
        db = DatabaseConnection()
        connection = db.get_connection()
        if not connection:
            return None

        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            return cursor.fetchone()
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def delete(user_id):
        db = DatabaseConnection()
        connection = db.get_connection()
        if not connection:
            return False

        cursor = connection.cursor()
        try:
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            connection.commit()
            return cursor.rowcount > 0
        finally:
            cursor.close()
            connection.close()

app = Flask(__name__)
app.secret_key = 'your-super-secret-key-here-cnvkjdfngkaprjqp9tuerthjkdsnfksvdlfinosvfuweoruveihfdfoijvimoerwjmhfjdrklfmeiufoqehdkvcjdfskgmheoir8tuq0eriojeiofcjmioewru'
app.config['SESSION_TYPE'] = 'filesystem'

app.config['GOOGLE_CLIENT_ID'] = '491962554405-dh97jjavc3ifkunhmifh0l9lb2qnvpdk.apps.googleusercontent.com'
app.config['GOOGLE_CLIENT_SECRET'] = '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'
app.config['GOOGLE_DISCOVERY_URL'] = "https://accounts.google.com/.well-known/openid-configuration"

os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

oauth_client = WebApplicationClient(app.config['GOOGLE_CLIENT_ID'])

assistant = AIAssistant()

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    user = User()
    return user.get(user_id)

def get_google_provider_cfg():
    try:
        return requests.get(app.config['GOOGLE_DISCOVERY_URL']).json()
    except:
        return None

@app.route('/api/auth/google/login')
def google_login():
    # Get Google's OAuth 2.0 provider configuration
    google_provider_cfg = get_google_provider_cfg()
    if not google_provider_cfg:
        return jsonify({"error": "Failed to get Google provider configuration"}), 500

    # Get the authorization endpoint
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Construct the request URL for Google login
    request_uri = oauth_client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=url_for('google_callback', _external=True),
        scope=['openid', 'email', 'profile'],
    )
    
    return jsonify({"auth_url": request_uri})

@app.route('/api/auth/google/callback')
def google_callback():
    code = request.args.get('code')
    google_provider_cfg = get_google_provider_cfg()
    
    token_endpoint = google_provider_cfg["token_endpoint"]
    
    token_url, headers, body = oauth_client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=url_for('google_callback', _external=True),
        code=code
    )
    
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(app.config['GOOGLE_CLIENT_ID'], app.config['GOOGLE_CLIENT_SECRET']),
    )

    oauth_client.parse_request_body_response(json.dumps(token_response.json()))
    
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = oauth_client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers)
    
    # Get user info regardless of email verification
    google_id = userinfo_response.json()["sub"]
    email = userinfo_response.json()["email"]
    name = userinfo_response.json().get("name")
    picture = userinfo_response.json().get("picture")

    # Create or get user
    user_data = get_or_create_google_user(google_id, email, name, picture)
    if user_data:
        user = User()
        user.get(user_data['id'])
        login_user(user)
        return redirect(url_for('some_frontend_route'))
    
    return jsonify({"error": "Failed to create or retrieve user"}), 500

def get_or_create_google_user(google_id, email, name, picture):
    db = DatabaseConnection()
    connection = db.get_connection()
    if not connection:
        return None

    cursor = connection.cursor(dictionary=True)
    try:
        # Check if user exists
        cursor.execute("""
            SELECT * FROM users 
            WHERE google_id = %s OR (email = %s AND auth_type = 'google')
        """, (google_id, email))
        user = cursor.fetchone()

        if user:
            # Update existing user
            cursor.execute("""
                UPDATE users 
                SET google_id = %s,
                    profile_picture = %s,
                    email = %s
                WHERE id = %s
            """, (google_id, picture, email, user['id']))
        else:
            # Create new user
            cursor.execute("""
                INSERT INTO users 
                (email, google_id, auth_type, profile_picture, password) 
                VALUES (%s, %s, 'google', %s, '')
            """, (email, google_id, picture))
            
            # Get the created user
            cursor.execute("SELECT * FROM users WHERE id = LAST_INSERT_ID()")
            user = cursor.fetchone()

        connection.commit()
        return user
    except Exception as e:
        print(f"Error managing Google user: {e}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()
        
#Auth endpoints
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400

    if User.get_by_email(data['email']):
        return jsonify({'error': 'Email already exists'}), 409

    user_id = User.create(data['email'], data['password'])
    if user_id:
        return jsonify({'message': 'User created successfully', 'user_id': user_id})
    return jsonify({'error': 'Could not create user'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400

    user_data = User.get_by_email(data['email'])
    if not user_data:
        return jsonify({'error': 'Invalid email or password'}), 401
        
    # Check if user is a Google user
    if user_data['auth_type'] == 'google':
        return jsonify({'error': 'Please use Google Sign-In for this account'}), 401

    if not check_password_hash(user_data['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    user = User()
    user.get(user_data['id'])
    login_user(user)
    return jsonify({'message': 'Logged in successfully', 'user_id': user_data['id']})

@app.route('/api/auth/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/auth/user', methods=['DELETE'])
@login_required
def delete_user():
    if User.delete(current_user.id):
        logout_user()
        return jsonify({'message': 'User deleted successfully'})
    return jsonify({'error': 'Could not delete user'}), 500

# Chat endpoints
@app.route('/api/chat', methods=['POST'])
@login_required
def chat():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400
    
    response_data = assistant.get_ai_response(data['message'])
    return jsonify({
        'response': response_data['text'],
        'context': response_data['context']
    })

@app.route('/api/chat/audio', methods=['POST'])
@login_required
def chat_with_audio():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400
    
    response = assistant.chat_and_speak(data['message'])
    return jsonify(response)

# Analytics endpoints
@app.route('/api/analytics', methods=['GET'])
@login_required
def get_analytics():
    return jsonify(assistant.analytics.data)

@app.route('/api/analytics/client/<client_name>', methods=['GET'])
@login_required
def get_client_analytics(client_name):
    summary = assistant.analytics.get_client_summary(client_name)
    if summary:
        return jsonify(summary)
    return jsonify({'error': 'Client not found'}), 404

# Knowledge Base endpoints
@app.route('/api/knowledge', methods=['GET'])
@login_required
def get_knowledge():
    return jsonify(assistant.knowledge_base.data)

@app.route('/api/knowledge', methods=['POST'])
@login_required
def add_knowledge():
    data = request.json
    if not data or 'category' not in data or 'content' not in data:
        return jsonify({'error': 'Category and content required'}), 400
    
    assistant.knowledge_base.add_knowledge(data['category'], data['content'])
    return jsonify({'message': 'Knowledge added successfully'})

@app.route('/api/knowledge/<category>', methods=['PUT'])
@login_required
def update_knowledge(category):
    data = request.json
    if not data or 'content' not in data:
        return jsonify({'error': 'Content required'}), 400
    
    assistant.knowledge_base.data['custom_knowledge'][category] = data['content']
    assistant.knowledge_base.save_knowledge_base()
    return jsonify({'message': 'Knowledge updated successfully'})

# AI Settings endpoints
@app.route('/api/settings', methods=['GET'])
@login_required
def get_settings():
    return jsonify(assistant.knowledge_base.data)

@app.route('/api/settings', methods=['PUT'])
@login_required
def update_settings():
    data = request.json
    if not data:
        return jsonify({'error': 'No settings provided'}), 400
    
    assistant.knowledge_base.update_settings(data)
    return jsonify({'message': 'Settings updated successfully'})

# Schedule endpoints
@app.route('/api/schedule/<day>', methods=['GET'])
@login_required
def get_schedule(day):
    available_slots = assistant.schedule.get_available_slots(day)
    return jsonify({'available_slots': available_slots})

@app.route('/api/schedule/appointment', methods=['POST'])
@login_required
def book_appointment():
    data = request.json
    if not all(k in data for k in ['day', 'time', 'client_name', 'appointment_type']):
        return jsonify({'error': 'Missing required booking information'}), 400
    
    success = assistant.schedule.book_appointment(
        data['day'],
        data['time'],
        data['client_name'],
        data['appointment_type']
    )
    
    if success:
        return jsonify({'message': 'Appointment booked successfully'})
    return jsonify({'error': 'Unable to book appointment'}), 400

# Conversation History endpoints
@app.route('/api/conversations', methods=['GET'])
@login_required
def get_conversations():
    conversations = assistant.analytics.data['conversations']
    return jsonify({'conversations': conversations})

@app.route('/api/conversations/<client_name>', methods=['GET'])
@login_required
def get_client_conversations(client_name):
    client_data = assistant.analytics.data['client_data'].get(client_name)
    if client_data:
        return jsonify({'conversations': client_data['conversation_history']})
    return jsonify({'error': 'Client not found'}), 404

# Export endpoints
@app.route('/api/export/analytics', methods=['GET'])
@login_required
def export_analytics():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"data/exports/analytics_export_{timestamp}.json"
    os.makedirs("data/exports", exist_ok=True)
    
    with open(filename, 'w') as file:
        json.dump(assistant.analytics.data, file, indent=4)
    
    return jsonify({
        'message': 'Analytics exported successfully',
        'file_path': filename
    })

@app.route('/api/export/knowledge', methods=['GET'])
@login_required
def export_knowledge():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"data/exports/knowledge_base_export_{timestamp}.json"
    os.makedirs("data/exports", exist_ok=True)
    
    with open(filename, 'w') as file:
        json.dump(assistant.knowledge_base.data, file, indent=4)
    
    return jsonify({
        'message': 'Knowledge base exported successfully',
        'file_path': filename
    })

if __name__ == '__main__':
    app.run(debug=True)
