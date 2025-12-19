# Arbor Enhanced: Ultimate Autonomous Enterprise AI System
# COMPLETE VERSION with Advanced Analytics, Intelligence & Automation

"""
ARBOR ENHANCED - COMPLETE AUTONOMOUS AI SYSTEM

Enhanced Features:
- Advanced Analytics & Reporting
- Calendar Intelligence with Free Slot Detection
- Document Intelligence & Action Item Extraction
- Advanced Task Filtering (overdue, upcoming, keywords)
- Visualization & Insights
- AI-Powered Recommendations
- Context-Aware Task Suggestions
- Productivity Pattern Analysis
- Original RAG Q&A & Autonomous Actions
- Google Drive, Calendar, Sheets integration
- Email automation with multiple recipients
- Bilingual: English & German
- 100% local processing
"""

import os
import sys
import json
import warnings
import pickle
import io
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

# LangChain
from langchain_community.llms import Ollama
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.docstore.document import Document

# Google APIs
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# Email
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Data processing
import pandas as pd
import numpy as np

warnings.filterwarnings('ignore')

print("""
Loading Arbor...
""")

# ============================================================================
# CONFIGURATION
# ============================================================================

class ArborConfig:
    """Centralized configuration"""
    
    BASE_DIR = Path("./arbor_data")
    DOCS_DIR = BASE_DIR / "documents"
    VECTOR_DB_DIR = BASE_DIR / "chroma_db"
    CREDENTIALS_DIR = BASE_DIR / "credentials"
    REPORTS_DIR = BASE_DIR / "reports"
    SHEETS_CACHE_DIR = BASE_DIR / "sheets_cache"
    
    LLM_MODEL = "deepseek-r1:7b"
    EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
    
    GOOGLE_SCOPES = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/spreadsheets'
    ]
    
    GDRIVE_FOLDER_IDS = ["13acOm3ejPdvrTJVGUOcNAuyN-Xwy3Mhi"]
    CALENDAR_IDS = ["primary","c_5a82a1fbb700ef520cbd345011f654481ec90a4e8da3fddaa90668f4a3ec8db7@group.calendar.google.com"]
    SHEETS_TRACKING = {"tasks": "1nhTypClL_Ginv8jqWVuIcxFfWAxrPaegq5PeaL88zJY"}
    
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    EMAIL_SENDER = "ks243@snu.edu.in"
    EMAIL_PASSWORD = "igyx pkmg tvcw ornw"
    EMAIL_RECIPIENTS = ["ks243@snu.edu.in"]
    
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    TOP_K_RESULTS = 5
    
    @classmethod
    def initialize_directories(cls):
        for dir_path in [cls.DOCS_DIR, cls.VECTOR_DB_DIR, 
                         cls.CREDENTIALS_DIR, cls.REPORTS_DIR,
                         cls.SHEETS_CACHE_DIR]:
            dir_path.mkdir(parents=True, exist_ok=True)

ArborConfig.initialize_directories()
print("✓ Configuration loaded")

# ============================================================================
# AI COMPONENTS
# ============================================================================

print("\nInitializing AI components...")

llm = Ollama(
    model=ArborConfig.LLM_MODEL,
    temperature=0.1,
    num_ctx=4096
)
try:
    test = llm.invoke("OK")
    print("✓ LLM initialized")
except Exception as e:
    print(f"⚠ LLM error: {e}")

embeddings = HuggingFaceEmbeddings(
    model_name=ArborConfig.EMBEDDING_MODEL,
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)
print("✓ Embeddings initialized")

# ============================================================================
# GOOGLE SERVICES AUTHENTICATION
# ============================================================================

class GoogleServicesAuth:
    def __init__(self):
        self.credentials_path = str(ArborConfig.CREDENTIALS_DIR / "credentials.json")
        self.token_path = str(ArborConfig.CREDENTIALS_DIR / "token.pickle")
        self.creds = None
    
    def authenticate(self):
        if os.path.exists(self.token_path):
            with open(self.token_path, 'rb') as token:
                self.creds = pickle.load(token)
        
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_path):
                    print(f"⚠ credentials.json not found")
                    return False
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, ArborConfig.GOOGLE_SCOPES
                )
                self.creds = flow.run_local_server(port=0)
            with open(self.token_path, 'wb') as token:
                pickle.dump(self.creds, token)
        
        print("✓ Google authenticated")
        return True
    
    def get_credentials(self):
        if not self.creds:
            self.authenticate()
        return self.creds

# ============================================================================
# GOOGLE DRIVE CONNECTOR
# ============================================================================

class GoogleDriveConnector:
    def __init__(self, auth):
        self.auth = auth
        self.service = None
    
    def initialize(self):
        if not self.auth.creds:
            if not self.auth.authenticate():
                return False
        self.service = build('drive', 'v3', credentials=self.auth.get_credentials())
        print("✓ Drive initialized")
        return True
    
    def list_files(self, folder_id: str = None, mime_types: List[str] = None):
        query_parts = []
        if folder_id:
            query_parts.append(f"'{folder_id}' in parents")
        if mime_types:
            mime_query = " or ".join([f"mimeType='{mt}'" for mt in mime_types])
            query_parts.append(f"({mime_query})")
        
        query = " and ".join(query_parts) if query_parts else None
        
        try:
            results = self.service.files().list(
                q=query, pageSize=100,
                fields="files(id, name, mimeType, modifiedTime, size)"
            ).execute()
            return results.get('files', [])
        except:
            return []
    
    def download_file(self, file_id: str, file_name: str) -> str:
        request = self.service.files().get_media(fileId=file_id)
        file_path = ArborConfig.DOCS_DIR / file_name
        fh = io.FileIO(file_path, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
        return str(file_path)
    
    def export_google_doc(self, file_id: str, file_name: str) -> str:
        request = self.service.files().export_media(fileId=file_id, mimeType='text/plain')
        file_path = ArborConfig.DOCS_DIR / f"{file_name}.txt"
        fh = io.FileIO(file_path, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
        return str(file_path)
    
    def export_google_sheet(self, file_id: str, file_name: str) -> str:
        request = self.service.files().export_media(fileId=file_id, mimeType='text/csv')
        file_path = ArborConfig.DOCS_DIR / f"{file_name}.csv"
        fh = io.FileIO(file_path, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
        return str(file_path)
    
    def extract_text(self, file_path: str, mime_type: str) -> str:
        try:
            if mime_type in ['text/plain', 'text/markdown', 'text/csv']:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
            elif mime_type == 'application/pdf':
                try:
                    import PyPDF2
                    with open(file_path, 'rb') as f:
                        pdf = PyPDF2.PdfReader(f)
                        return '\n'.join([page.extract_text() for page in pdf.pages])
                except ImportError:
                    return f"[PDF: {Path(file_path).name}]"
            else:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
        except Exception as e:
            return f"[Error reading {Path(file_path).name}]"
    
    def ingest_documents(self):
        folder_ids = ArborConfig.GDRIVE_FOLDER_IDS
        documents = []
        supported = [
            'application/pdf',
            'application/vnd.google-apps.document',
            'text/plain',
            'application/vnd.google-apps.spreadsheet',
            'text/markdown', 'text/csv'
        ]
        
        for folder_id in folder_ids:
            files = self.list_files(folder_id, supported)
            
            for file in files:
                try:
                    mime = file['mimeType']
                    
                    if mime == 'application/vnd.google-apps.document':
                        path = self.export_google_doc(file['id'], file['name'])
                    elif mime == 'application/vnd.google-apps.spreadsheet':
                        path = self.export_google_sheet(file['id'], file['name'])
                    else:
                        path = self.download_file(file['id'], file['name'])
                    
                    content = self.extract_text(path, mime)
                    
                    if not content or len(content.strip()) < 10:
                        continue
                    
                    documents.append(Document(
                        page_content=content,
                        metadata={
                            'source': file['name'],
                            'file_id': file['id'],
                            'type': 'google_drive',
                            'modified': file.get('modifiedTime', ''),
                            'mime_type': mime
                        }
                    ))
                except:
                    pass
        
        return documents

# ============================================================================
# GOOGLE CALENDAR CONNECTOR
# ============================================================================

class GoogleCalendarConnector:
    def __init__(self, auth):
        self.auth = auth
        self.service = None
    
    def initialize(self):
        if not self.auth.creds:
            if not self.auth.authenticate():
                return False
        self.service = build('calendar', 'v3', credentials=self.auth.get_credentials())
        print("✓ Calendar initialized")
        return True
    
    def get_todays_events(self, calendar_id='primary'):
        today = datetime.now()
        start = today.replace(hour=0, minute=0, second=0).isoformat() + 'Z'
        end = today.replace(hour=23, minute=59, second=59).isoformat() + 'Z'
        try:
            result = self.service.events().list(
                calendarId=calendar_id, timeMin=start, timeMax=end,
                singleEvents=True, orderBy='startTime'
            ).execute()
            return result.get('items', [])
        except:
            return []
    
    def get_upcoming_events(self, calendar_id='primary', days_ahead=7):
        now = datetime.utcnow().isoformat() + 'Z'
        end = (datetime.utcnow() + timedelta(days=days_ahead)).isoformat() + 'Z'
        try:
            result = self.service.events().list(
                calendarId=calendar_id, timeMin=now, timeMax=end,
                maxResults=100, singleEvents=True, orderBy='startTime'
            ).execute()
            return result.get('items', [])
        except:
            return []
    
    def ingest_calendar_data(self):
        documents = []
        for cal_id in ArborConfig.CALENDAR_IDS:
            events = self.get_upcoming_events(cal_id, days_ahead=14)
            
            for event in events:
                summary = event.get('summary', 'No title')
                start = event.get('start', {}).get('dateTime', '')
                desc = event.get('description', '')
                
                content = f"Calendar Event: {summary}\nTime: {start[:16] if start else 'TBD'}\nDescription: {desc}"
                
                documents.append(Document(
                    page_content=content,
                    metadata={'source': 'Calendar', 'type': 'calendar_event', 'summary': summary}
                ))
        
        return documents

# ============================================================================
# GOOGLE SHEETS CONNECTOR
# ============================================================================

class GoogleSheetsConnector:
    def __init__(self, auth):
        self.auth = auth
        self.service = None
    
    def initialize(self):
        if not self.auth.creds:
            if not self.auth.authenticate():
                return False
        self.service = build('sheets', 'v4', credentials=self.auth.get_credentials())
        print("✓ Sheets initialized")
        return True
    
    def read_sheet(self, spreadsheet_id: str, range_name: str):
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id, range=range_name
            ).execute()
            return result.get('values', [])
        except:
            return []
    
    def append_row(self, spreadsheet_id: str, range_name: str, values: List[List]) -> bool:
        try:
            body = {'values': values}
            result = self.service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id, range=range_name,
                valueInputOption='USER_ENTERED',
                insertDataOption='INSERT_ROWS', body=body
            ).execute()
            print(f"✓ Added {result.get('updates', {}).get('updatedRows', 0)} row(s)")
            return True
        except Exception as e:
            print(f"✗ Write error: {e}")
            return False
    
    def get_sheet_as_dataframe(self, spreadsheet_id: str, range_name: str = 'A:Z'):
        data = self.read_sheet(spreadsheet_id, range_name)
        if not data:
            return pd.DataFrame()
        return pd.DataFrame(data[1:], columns=data[0])
    
    def query_sheet_data(self, sheet_type: str, query: str = "") -> str:
        cache_files = list(ArborConfig.SHEETS_CACHE_DIR.glob(f"{sheet_type}_*.csv"))
        if not cache_files:
            configs = ArborConfig.SHEETS_TRACKING
            if sheet_type in configs:
                df = self.get_sheet_as_dataframe(configs[sheet_type])
                if not df.empty:
                    return f"{sheet_type} sheet:\nTotal: {len(df)} rows\n\n{df.to_string(index=False)}"
            return f"No data for {sheet_type}"
        
        latest = max(cache_files, key=lambda p: p.stat().st_mtime)
        try:
            df = pd.read_csv(latest)
            return f"{sheet_type} sheet:\nTotal: {len(df)} rows\n\n{df.to_string(index=False)}"
        except:
            return f"Error reading {sheet_type}"
    
    def ingest_sheets_data(self):
        documents = []
        for sheet_type, sheet_id in ArborConfig.SHEETS_TRACKING.items():
            try:
                df = self.get_sheet_as_dataframe(sheet_id)
                if not df.empty:
                    cache_path = ArborConfig.SHEETS_CACHE_DIR / f"{sheet_type}_{datetime.now().strftime('%Y%m%d')}.csv"
                    df.to_csv(cache_path, index=False)
                    
                    summary = f"Sheet: {sheet_type}\nRows: {len(df)}\n{df.head(10).to_string(index=False)}"
                    documents.append(Document(
                        page_content=summary,
                        metadata={'source': f'Sheets-{sheet_type}', 'type': 'sheet'}
                    ))
            except:
                pass
        return documents

# ============================================================================
# EMAIL AUTOMATION
# ============================================================================

class EmailAutomation:
    def __init__(self):
        self.smtp_server = ArborConfig.SMTP_SERVER
        self.smtp_port = ArborConfig.SMTP_PORT
        self.sender = ArborConfig.EMAIL_SENDER
        self.password = ArborConfig.EMAIL_PASSWORD
    
    def send_report(self, subject: str, body: str, recipients: List[str] = None):
        recipients = recipients or ArborConfig.EMAIL_RECIPIENTS
        
        if isinstance(recipients, str):
            recipients = [recipients]
        
        cleaned_recipients = []
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
        for recipient in recipients:
            matches = re.findall(email_pattern, str(recipient))
            for match in matches:
                if '@' in match and '.' in match:
                    cleaned_recipients.append(match)
        
        if not cleaned_recipients:
            print("✗ No valid email addresses found")
            return False
        
        try:
            msg = MIMEMultipart()
            msg['Subject'] = subject
            msg['From'] = self.sender
            msg['To'] = ', '.join(cleaned_recipients)
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender, self.password)
                server.send_message(msg)
            
            print(f"✓ Email sent to: {', '.join(cleaned_recipients)}")
            return True
        except Exception as e:
            print(f"✗ Email error: {e}")
            return False

# ============================================================================
# INITIALIZE SERVICES
# ============================================================================

print("\n" + "="*70)
print("INITIALIZING SERVICES")
print("="*70)

google_auth = GoogleServicesAuth()
try:
    google_auth.authenticate()
except:
    pass

gdrive_connector = GoogleDriveConnector(google_auth)
calendar_connector = GoogleCalendarConnector(google_auth)
sheets_connector = GoogleSheetsConnector(google_auth)
email_automation = EmailAutomation()

try:
    gdrive_connector.initialize()
    calendar_connector.initialize()
    sheets_connector.initialize()
except:
    pass

# ============================================================================
# DATA INGESTION
# ============================================================================

print("\n" + "="*70)
print("DATA INGESTION")
print("="*70)

all_documents = []

print("\nDrive...")
try:
    gdrive_docs = gdrive_connector.ingest_documents()
    all_documents.extend(gdrive_docs)
    print(f"✓ {len(gdrive_docs)} docs")
except:
    gdrive_docs = []

print("\nCalendar...")
try:
    calendar_docs = calendar_connector.ingest_calendar_data()
    all_documents.extend(calendar_docs)
    print(f"✓ {len(calendar_docs)} events")
except:
    calendar_docs = []

print("\nSheets...")
try:
    sheets_docs = sheets_connector.ingest_sheets_data()
    all_documents.extend(sheets_docs)
    print(f"✓ {len(sheets_docs)} sheets")
except:
    sheets_docs = []

if len(all_documents) == 0:
    print("\nAdding live data...")
    try:
        tasks = sheets_connector.query_sheet_data('tasks')
        if "No data" not in tasks:
            all_documents.append(Document(page_content=f"TASKS:\n{tasks}", metadata={'source': 'Tasks', 'type': 'live'}))
    except:
        pass
    
    try:
        meetings = calendar_connector.get_upcoming_events(days_ahead=14)
        if meetings:
            text = "MEETINGS:\n"
            for e in meetings:
                text += f"• {e.get('summary', 'Untitled')} - {e.get('start', {}).get('dateTime', 'TBD')[:16]}\n"
            all_documents.append(Document(page_content=text, metadata={'source': 'Calendar', 'type': 'live'}))
    except:
        pass

print(f"\nTOTAL: {len(all_documents)} documents")

# ============================================================================
# VECTOR STORE & RAG
# ============================================================================

print("\n" + "="*70)
print("VECTOR STORE")
print("="*70)

class VectorStoreManager:
    def __init__(self, embeddings, persist_directory):
        self.embeddings = embeddings
        self.persist_directory = persist_directory
        self.vectorstore = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=ArborConfig.CHUNK_SIZE,
            chunk_overlap=ArborConfig.CHUNK_OVERLAP
        )
    
    def create_vectorstore(self, documents):
        if not documents:
            return None
        
        print(f"Chunking...")
        chunks = self.text_splitter.split_documents(documents)
        print(f"✓ {len(chunks)} chunks")
        
        print("Building...")
        self.vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory=self.persist_directory,
            collection_name="arbor_knowledge"
        )
        print(f"✓ Ready")
        return self.vectorstore
    
    def search(self, query: str, k: int = 5):
        if not self.vectorstore:
            return []
        return self.vectorstore.similarity_search(query, k=k)

vectorstore_manager = VectorStoreManager(embeddings, str(ArborConfig.VECTOR_DB_DIR))

if all_documents:
    vectorstore = vectorstore_manager.create_vectorstore(all_documents)
else:
    vectorstore = None

ARBOR_PROMPT = """You are Arbor, ClerkTree's AI assistant.

Context: {context}
Question: {question}

Answer in the SAME LANGUAGE as the question. Be precise.

Answer:"""

arbor_prompt = PromptTemplate(template=ARBOR_PROMPT, input_variables=["context", "question"])

if vectorstore:
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": ArborConfig.TOP_K_RESULTS}),
        chain_type_kwargs={"prompt": arbor_prompt},
        return_source_documents=True
    )
    print("✓ RAG ready")
else:
    qa_chain = None

# ============================================================================
# ASK ARBOR
# ============================================================================

def ask_arbor(question: str, verbose: bool = True):
    if not qa_chain:
        q = question.lower()
        try:
            if 'task' in q:
                result = sheets_connector.query_sheet_data('tasks')
            elif 'meeting' in q:
                if 'today' in q:
                    events = calendar_connector.get_todays_events()
                else:
                    events = calendar_connector.get_upcoming_events()
                result = f"{len(events)} meetings"
            else:
                result = "Ask about tasks or meetings"
            
            if verbose:
                print(f"\n❓ {question}\n💡 {result}")
            return {"answer": result}
        except:
            return {"error": "Error"}
    
    try:
        result = qa_chain.invoke({"query": question})
        answer = result['result']
        
        if verbose:
            print(f"\n❓ {question}\n💡 {answer}")
        
        return {"question": question, "answer": answer, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        return {"error": str(e)}

# ============================================================================
# BASIC TOOLS
# ============================================================================

print("\n" + "="*70)
print("BASIC TOOLS")
print("="*70)

class ComprehensiveTools:
    def __init__(self, calendar, sheets, email, qa_chain, vectorstore):
        self.calendar = calendar
        self.sheets = sheets
        self.email = email
        self.qa = qa_chain
        self.vectorstore = vectorstore
    
    def _extract_emails(self, text: str) -> List[str]:
        return re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    
    def _parse_sheet_type(self, text: str) -> str:
        text_lower = text.lower()
        if any(w in text_lower for w in ['task', 'todo']):
            return 'tasks'
        return 'tasks'
    
    def get_meetings_today(self, input_text: str = "") -> str:
        try:
            events = self.calendar.get_todays_events()
            if not events:
                return "No meetings today."
            
            result = f"Today's Meetings ({len(events)}):\n\n"
            for event in events:
                summary = event.get('summary', 'Untitled')
                start = event.get('start', {}).get('dateTime', 'TBD')
                time_str = start[11:16] if len(start) > 11 else 'TBD'
                result += f"• {time_str} - {summary}\n"
            return result
        except:
            return "Error getting meetings"
    
    def get_meetings_upcoming(self, input_text: str = "") -> str:
        try:
            days = 7
            numbers = re.findall(r'\d+', input_text)
            if numbers:
                days = int(numbers[0])
            
            events = self.calendar.get_upcoming_events(days_ahead=days)
            if not events:
                return f"No meetings in next {days} days."
            
            result = f"Upcoming ({len(events)}):\n\n"
            for event in events:
                summary = event.get('summary', 'Untitled')
                start = event.get('start', {}).get('dateTime', 'TBD')
                date_str = start[:10] if len(start) > 10 else 'TBD'
                result += f"• {date_str} - {summary}\n"
            return result
        except:
            return "Error"
    
    def read_sheet(self, input_text: str) -> str:
        try:
            sheet_type = self._parse_sheet_type(input_text)
            data = self.sheets.query_sheet_data(sheet_type)
            return data if "No data" not in data else f"{sheet_type} is empty"
        except:
            return "Error"
    
    def write_sheet(self, input_text: str) -> str:
        try:
            parts = input_text.split('|')
            if len(parts) < 2:
                return "Format: 'type|val1|val2'"
            
            sheet_type = self._parse_sheet_type(parts[0])
            values = [parts[1:]]
            
            configs = ArborConfig.SHEETS_TRACKING
            if sheet_type not in configs:
                return f"Unknown: {sheet_type}"
            
            success = self.sheets.append_row(configs[sheet_type], 'A:Z', values)
            return f"✓ Added to {sheet_type}" if success else "✗ Failed"
        except:
            return "Error"
    
    def send_email(self, input_text: str) -> str:
        try:
            pipe_parts = input_text.split('|')
            
            if len(pipe_parts) < 2:
                return "Error: Invalid format. Expected 'emails|subject|body'"
            
            emails = self._extract_emails(pipe_parts[0])
            if not emails:
                return "No valid email addresses found."
            
            subject = "Your Tasks"
            body = ""
            
            if len(pipe_parts) >= 3:
                subject = pipe_parts[1].strip()
                body = pipe_parts[2].strip()
            elif len(pipe_parts) == 2:
                body = pipe_parts[1].strip()
            
            if not body or len(body.strip()) < 10:
                return "Error: Email body is too short or missing."
            
            success = self.email.send_report(
                subject=subject,
                body=body,
                recipients=emails
            )
            
            if success:
                return f"✓ Email sent to: {', '.join(emails)}"
            return "✗ Failed to send email"
                
        except Exception as e:
            return f"Error sending email: {e}"
    
    def meeting_to_task(self, input_text: str = "") -> str:
        try:
            events = self.calendar.get_todays_events()
            if not events:
                return "No meetings"
            
            event = events[0]
            summary = event.get('summary', 'Meeting')
            start = event.get('start', {}).get('dateTime', '')
            date = start[:10] if start else datetime.now().strftime('%Y-%m-%d')
            
            task_data = f"tasks|Follow-up: {summary}|Pending|Medium|{date}"
            return self.write_sheet(task_data)
        except:
            return "Error"
    
    def search_knowledge(self, input_text: str) -> str:
        try:
            results = self.vectorstore.search(input_text, k=3)
            if not results:
                return "No results"
            
            output = "Knowledge Base:\n\n"
            for i, doc in enumerate(results, 1):
                source = doc.metadata.get('source', 'Unknown')
                content = doc.page_content[:200]
                output += f"{i}. {source}\n{content}...\n\n"
            return output
        except:
            return "Error"
    
    def ask_ai(self, input_text: str) -> str:
        try:
            result = ask_arbor(input_text, verbose=False)
            return result.get('answer', 'No answer')
        except:
            return "Error"
    
    def get_time(self, input_text: str = "") -> str:
        now = datetime.now()
        return f"Current: {now.strftime('%Y-%m-%d %H:%M:%S (%A)')}"

comprehensive_tools = ComprehensiveTools(
    calendar=calendar_connector,
    sheets=sheets_connector,
    email=email_automation,
    qa_chain=qa_chain,
    vectorstore=vectorstore_manager
)

print("✓ Basic tools ready")

# ============================================================================
# ADVANCED TOOLS FOR COMPREHENSIVE ARBOR_DO
# ============================================================================

print("\n" + "="*70)
print("ADVANCED TOOLS")
print("="*70)

class AdvancedTools:
    """Extended toolset for advanced autonomous operations"""
    
    def __init__(self, calendar, sheets, email, qa_chain, vectorstore, gdrive):
        self.calendar = calendar
        self.sheets = sheets
        self.email = email
        self.qa = qa_chain
        self.vectorstore = vectorstore
        self.gdrive = gdrive
    
    # ========================================================================
    # ANALYTICS & REPORTING
    # ========================================================================
    
    def generate_task_report(self, input_text: str) -> str:
        """Generate comprehensive task reports with filtering"""
        try:
            period = "week"
            if "month" in input_text.lower():
                period = "month"
            elif "today" in input_text.lower():
                period = "today"
            
            df = self.sheets.get_sheet_as_dataframe(
                ArborConfig.SHEETS_TRACKING['tasks']
            )
            
            if df.empty:
                return "No tasks found for report generation."
            
            df.columns = df.columns.str.strip().str.lower()
            
            now = datetime.now()
            if period == "week":
                start_date = now - timedelta(days=7)
                period_label = "This Week"
            elif period == "month":
                start_date = now - timedelta(days=30)
                period_label = "This Month"
            else:
                start_date = now.replace(hour=0, minute=0, second=0)
                period_label = "Today"
            
            report = f"TASK REPORT - {period_label}\n"
            report += f"{'='*60}\n\n"
            
            total = len(df)
            report += f"Total Tasks: {total}\n\n"
            
            if 'status' in df.columns:
                status_counts = df['status'].value_counts()
                report += "Status Breakdown:\n"
                for status, count in status_counts.items():
                    pct = (count/total)*100
                    report += f" • {status}: {count} ({pct:.1f}%)\n"
                report += "\n"
            
            if 'priority' in df.columns:
                priority_counts = df['priority'].value_counts()
                report += "Priority Breakdown:\n"
                for priority, count in priority_counts.items():
                    pct = (count/total)*100
                    report += f" • {priority}: {count} ({pct:.1f}%)\n"
                report += "\n"
            
            if 'status' in df.columns:
                completed = len(df[df['status'].str.lower().str.contains('done|completed', na=False)])
                completion_rate = (completed/total)*100
                report += f"Completion Rate: {completion_rate:.1f}%\n"
                report += f" ({completed}/{total} tasks completed)\n\n"
            
            if 'due date' in df.columns or 'due_date' in df.columns:
                date_col = 'due date' if 'due date' in df.columns else 'due_date'
                try:
                    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                    overdue = df[
                        (df[date_col] < now) &
                        (~df['status'].str.lower().str.contains('done|completed', na=False))
                    ]
                    if len(overdue) > 0:
                        report += f"Overdue Tasks: {len(overdue)}\n"
                        for _, task in overdue.head(5).iterrows():
                            task_name = task.get('task', task.get('name', 'Unnamed'))
                            report += f" • {task_name}\n"
                        report += "\n"
                except:
                    pass
            
            if 'priority' in df.columns:
                high_priority = df[df['priority'].str.lower().str.contains('high', na=False)]
                if len(high_priority) > 0:
                    report += f"High Priority Tasks: {len(high_priority)}\n"
                    for _, task in high_priority.head(5).iterrows():
                        task_name = task.get('task', task.get('name', 'Unnamed'))
                        status = task.get('status', 'Unknown')
                        report += f" • {task_name} [{status}]\n"
                    report += "\n"
            
            report += f"{'='*60}\n"
            report += f"Generated: {now.strftime('%Y-%m-%d %H:%M:%S')}\n"
            
            return report
            
        except Exception as e:
            return f"Error generating report: {e}"
    
    def analyze_productivity(self, input_text: str) -> str:
        """Analyze productivity patterns and provide insights"""
        try:
            df = self.sheets.get_sheet_as_dataframe(
                ArborConfig.SHEETS_TRACKING['tasks']
            )
            
            if df.empty:
                return "No data available for productivity analysis."
            
            df.columns = df.columns.str.strip().str.lower()
            
            analysis = "PRODUCTIVITY ANALYSIS\n"
            analysis += f"{'='*60}\n\n"
            
            if 'status' in df.columns:
                completed = len(df[df['status'].str.lower().str.contains('done|completed', na=False)])
                in_progress = len(df[df['status'].str.lower().str.contains('progress', na=False)])
                pending = len(df[df['status'].str.lower().str.contains('pending', na=False)])
                
                analysis += "Current State:\n"
                analysis += f"Completed: {completed}\n"
                analysis += f"In Progress: {in_progress}\n"
                analysis += f"Pending: {pending}\n\n"
                
                analysis += "Insights:\n"
                
                if pending > completed:
                    analysis += " • You have more pending tasks than completed. Consider breaking down large tasks.\n"
                
                if in_progress > 5:
                    analysis += " • Many tasks in progress. Focus on completing existing tasks before starting new ones.\n"
                
                if completed > pending + in_progress:
                    analysis += " • Great job! You're completing tasks faster than adding new ones.\n"
                
                if 'priority' in df.columns:
                    high_priority_pending = len(df[
                        (df['priority'].str.lower().str.contains('high', na=False)) &
                        (~df['status'].str.lower().str.contains('done|completed', na=False))
                    ])
                    
                    if high_priority_pending > 0:
                        analysis += f" • {high_priority_pending} high priority tasks need attention.\n"
                
                analysis += "\n"
                
                analysis += "Recommendations:\n"
                analysis += " 1. Focus on completing high priority tasks first\n"
                analysis += " 2. Limit work-in-progress to 3-5 tasks maximum\n"
                analysis += " 3. Review and update task status daily\n"
                analysis += " 4. Break large tasks into smaller, actionable items\n"
            
            return analysis
            
        except Exception as e:
            return f"Error analyzing productivity: {e}"
    
    # ========================================================================
    # ADVANCED CALENDAR OPERATIONS
    # ========================================================================
    
    def find_free_slots(self, input_text: str) -> str:
        """Find available time slots in calendar"""
        try:
            duration_hours = 1
            days_ahead = 7
            
            numbers = re.findall(r'\d+', input_text)
            if numbers:
                if 'hour' in input_text.lower():
                    duration_hours = int(numbers[0])
                if 'day' in input_text.lower() or 'week' in input_text.lower():
                    days_ahead = int(numbers[-1])
            
            events = self.calendar.get_upcoming_events(days_ahead=days_ahead)
            
            busy_slots = []
            for event in events:
                start_str = event.get('start', {}).get('dateTime', '')
                end_str = event.get('end', {}).get('dateTime', '')
                if start_str and end_str:
                    try:
                        start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                        end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                        busy_slots.append((start, end))
                    except:
                        pass
            
            free_slots = []
            current = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
            end_date = current + timedelta(days=days_ahead)
            
            while current < end_date:
                slot_start = current
                slot_end = current + timedelta(hours=duration_hours)
                
                is_free = True
                for busy_start, busy_end in busy_slots:
                    if (slot_start < busy_end and slot_end > busy_start):
                        is_free = False
                        break
                
                if is_free and 9 <= current.hour < 18:
                    free_slots.append((slot_start, slot_end))
                
                current += timedelta(hours=1)
                
                if current.hour >= 18:
                    current = current.replace(hour=9, minute=0) + timedelta(days=1)
            
            result = f"FREE TIME SLOTS ({duration_hours}h duration)\n"
            result += f"{'='*60}\n\n"
            
            if not free_slots:
                result += "No free slots found in the specified period.\n"
            else:
                slots_by_day = {}
                for start, end in free_slots[:20]:
                    day = start.strftime('%A, %B %d')
                    if day not in slots_by_day:
                        slots_by_day[day] = []
                    slots_by_day[day].append((start, end))
                
                for day, slots in slots_by_day.items():
                    result += f"{day}:\n"
                    for start, end in slots:
                        result += f" • {start.strftime('%I:%M %p')} - {end.strftime('%I:%M %p')}\n"
                    result += "\n"
            
            return result
            
        except Exception as e:
            return f"Error finding free slots: {e}"
    
    def calculate_meeting_hours(self, input_text: str) -> str:
        """Calculate total meeting hours"""
        try:
            days = 7
            numbers = re.findall(r'\d+', input_text)
            if numbers:
                days = int(numbers[0])
            
            events = self.calendar.get_upcoming_events(days_ahead=days)
            
            total_minutes = 0
            meeting_count = 0
            
            for event in events:
                start_str = event.get('start', {}).get('dateTime', '')
                end_str = event.get('end', {}).get('dateTime', '')
                
                if start_str and end_str:
                    try:
                        start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                        end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                        duration = (end - start).total_seconds() / 60
                        total_minutes += duration
                        meeting_count += 1
                    except:
                        pass
            
            total_hours = total_minutes / 60
            avg_duration = total_minutes / meeting_count if meeting_count > 0 else 0
            
            result = f"MEETING TIME ANALYSIS\n"
            result += f"{'='*60}\n\n"
            result += f"Total Meetings: {meeting_count}\n"
            result += f"Total Hours: {total_hours:.1f}h ({total_minutes:.0f} minutes)\n"
            result += f"Average Duration: {avg_duration:.0f} minutes\n"
            result += f"Period: Next {days} days\n\n"
            
            if meeting_count > 0:
                daily_hours = total_hours / days
                result += f"Average per day: {daily_hours:.1f}h\n"
                
                if daily_hours > 4:
                    result += "\nWarning: High meeting load (>4h/day)\n"
                    result += " Consider blocking focus time for deep work.\n"
            
            return result
            
        except Exception as e:
            return f"Error calculating meeting hours: {e}"
    
    # ========================================================================
    # DOCUMENT INTELLIGENCE
    # ========================================================================
    
    def extract_action_items(self, input_text: str) -> str:
        """Extract action items from documents and create tasks"""
        try:
            search_query = input_text.lower()
            if "meeting" in search_query or "notes" in search_query:
                search_query = "meeting notes action items"
            
            docs = self.vectorstore.search(search_query, k=3)
            
            if not docs:
                return "No relevant documents found."
            
            prompt = f"""Analyze these documents and extract concrete action items:
{chr(10).join([doc.page_content[:500] for doc in docs])}
List each action item in this format:
- [Action item description]
Focus on tasks, to-dos, and actionable items only."""
            
            result = self.qa.llm.invoke(prompt)
            
            action_items = []
            for line in result.split('\n'):
                line = line.strip()
                if line.startswith('-') or line.startswith('•'):
                    item = line[1:].strip()
                    if len(item) > 10:
                        action_items.append(item)
            
            if not action_items:
                return "No clear action items found in documents."
            
            output = f"EXTRACTED ACTION ITEMS\n{'='*60}\n\n"
            added = 0
            
            for item in action_items[:10]:
                try:
                    date = datetime.now().strftime('%Y-%m-%d')
                    success = self.sheets.append_row(
                        ArborConfig.SHEETS_TRACKING['tasks'],
                        'A:Z',
                        [[item, 'Pending', 'Medium', date]]
                    )
                    if success:
                        output += f"✓ {item}\n"
                        added += 1
                    else:
                        output += f"✗ {item}\n"
                except:
                    output += f"✗ {item}\n"
            
            output += f"\n{'='*60}\n"
            output += f"Added {added}/{len(action_items)} action items to tasks.\n"
            
            return output
            
        except Exception as e:
            return f"Error extracting action items: {e}"
    
    def summarize_recent_documents(self, input_text: str) -> str:
        """Summarize documents modified recently"""
        try:
            days = 7
            if "today" in input_text.lower():
                days = 1
            elif "week" in input_text.lower():
                days = 7
            elif "month" in input_text.lower():
                days = 30
            
            files = self.gdrive.list_files(
                folder_id=ArborConfig.GDRIVE_FOLDER_IDS[0]
            )
            
            cutoff = datetime.now() - timedelta(days=days)
            recent_files = []
            
            for file in files:
                try:
                    modified = datetime.fromisoformat(
                        file.get('modifiedTime', '').replace('Z', '+00:00')
                    )
                    if modified > cutoff:
                        recent_files.append(file)
                except:
                    pass
            
            if not recent_files:
                return f"No documents modified in the last {days} day(s)."
            
            summary = f"RECENT DOCUMENT SUMMARY\n{'='*60}\n\n"
            summary += f"Found {len(recent_files)} document(s) modified in last {days} day(s):\n\n"
            
            for file in recent_files[:10]:
                name = file.get('name', 'Unnamed')
                modified = file.get('modifiedTime', 'Unknown')[:10]
                summary += f"• {name} (Modified: {modified})\n"
            
            return summary
            
        except Exception as e:
            return f"Error summarizing documents: {e}"
    
    # ========================================================================
    # ADVANCED FILTERING
    # ========================================================================
    
    def filter_overdue_tasks(self, input_text: str) -> str:
        """Find and return overdue tasks"""
        try:
            df = self.sheets.get_sheet_as_dataframe(
                ArborConfig.SHEETS_TRACKING['tasks']
            )
            
            if df.empty:
                return "No tasks found."
            
            df.columns = df.columns.str.strip().str.lower()
            
            date_col = None
            for col in ['due date', 'due_date', 'date', 'deadline']:
                if col in df.columns:
                    date_col = col
                    break
            
            if not date_col:
                return "No due date column found in tasks sheet."
            
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            now = datetime.now()
            
            overdue = df[
                (df[date_col] < now) &
                (~df['status'].str.lower().str.contains('done|completed', na=False))
            ]
            
            if overdue.empty:
                return "No overdue tasks! You're all caught up."
            
            result = f"OVERDUE TASKS ({len(overdue)})\n{'='*60}\n\n"
            
            for _, task in overdue.iterrows():
                task_name = task.get('task', task.get('name', 'Unnamed'))
                due = task[date_col].strftime('%Y-%m-%d') if pd.notna(task[date_col]) else 'No date'
                priority = task.get('priority', 'Unknown')
                days_overdue = (now - task[date_col]).days if pd.notna(task[date_col]) else 0
                
                result += f"• {task_name}\n"
                result += f" Due: {due} ({days_overdue} days ago)\n"
                result += f" Priority: {priority}\n\n"
            
            return result
            
        except Exception as e:
            return f"Error filtering overdue tasks: {e}"
    
    def filter_tasks_by_keyword(self, input_text: str) -> str:
        """Filter tasks by keyword or phrase"""
        try:
            keywords = input_text.lower().replace('find tasks', '').replace('related to', '').strip()
            
            df = self.sheets.get_sheet_as_dataframe(
                ArborConfig.SHEETS_TRACKING['tasks']
            )
            
            if df.empty:
                return "No tasks found."
            
            df.columns = df.columns.str.strip().str.lower()
            
            mask = df.apply(lambda row: row.astype(str).str.contains(keywords, case=False, na=False).any(), axis=1)
            filtered = df[mask]
            
            if filtered.empty:
                return f"No tasks found matching '{keywords}'."
            
            result = f"TASKS MATCHING '{keywords}' ({len(filtered)})\n{'='*60}\n\n"
            result += filtered.to_string(index=False)
            
            return result
            
        except Exception as e:
            return f"Error filtering tasks: {e}"
    
    # ========================================================================
    # VISUALIZATION
    # ========================================================================
    
    def create_task_visualization(self, input_text: str) -> str:
        """Create ASCII visualizations of task data"""
        try:
            df = self.sheets.get_sheet_as_dataframe(
                ArborConfig.SHEETS_TRACKING['tasks']
            )
            
            if df.empty:
                return "No tasks to visualize."
            
            df.columns = df.columns.str.strip().str.lower()
            
            viz_type = "status"
            if "priority" in input_text.lower():
                viz_type = "priority"
            
            result = f"TASK VISUALIZATION\n{'='*60}\n\n"
            
            if viz_type == "status" and 'status' in df.columns:
                status_counts = df['status'].value_counts()
                result += "Status Distribution:\n\n"
                
                max_count = status_counts.max()
                for status, count in status_counts.items():
                    bar_length = int((count / max_count) * 40)
                    bar = '█' * bar_length
                    pct = (count / len(df)) * 100
                    result += f"{status:15} {bar} {count} ({pct:.1f}%)\n"
            
            elif viz_type == "priority" and 'priority' in df.columns:
                priority_counts = df['priority'].value_counts()
                result += "Priority Distribution:\n\n"
                
                max_count = priority_counts.max()
                for priority, count in priority_counts.items():
                    bar_length = int((count / max_count) * 40)
                    bar = '█' * bar_length
                    pct = (count / len(df)) * 100
                    result += f"{priority:15} {bar} {count} ({pct:.1f}%)\n"
            
            return result
            
        except Exception as e:
            return f"Error creating visualization: {e}"
    
    # ========================================================================
    # AI-POWERED RECOMMENDATIONS
    # ========================================================================
    
    def suggest_task_order(self, input_text: str) -> str:
        """Suggest optimal task order based on priority and context"""
        try:
            df = self.sheets.get_sheet_as_dataframe(
                ArborConfig.SHEETS_TRACKING['tasks']
            )
            
            if df.empty:
                return "No tasks to order."
            
            df.columns = df.columns.str.strip().str.lower()
            
            active = df[~df['status'].str.lower().str.contains('done|completed', na=False)]
            
            if active.empty:
                return "All tasks completed!"
            
            meetings = self.calendar.get_todays_events()
            has_meetings = len(meetings) > 0
            
            result = f"SUGGESTED TASK ORDER\n{'='*60}\n\n"
            
            priority_score = {'high': 3, 'medium': 2, 'low': 1}
            
            scored_tasks = []
            for _, task in active.iterrows():
                score = 0
                task_name = task.get('task', task.get('name', 'Unnamed'))
                
                priority = task.get('priority', 'medium').lower()
                score += priority_score.get(priority, 2)
                
                if 'due date' in task or 'due_date' in task:
                    date_col = 'due date' if 'due date' in task else 'due_date'
                    try:
                        due = pd.to_datetime(task[date_col])
                        days_until = (due - datetime.now()).days
                        if days_until < 0:
                            score += 5
                        elif days_until < 2:
                            score += 4
                        elif days_until < 7:
                            score += 2
                    except:
                        pass
                
                scored_tasks.append((score, task_name, priority))
            
            scored_tasks.sort(reverse=True, key=lambda x: x[0])
            
            if has_meetings:
                result += "You have meetings today - prioritizing quick wins:\n\n"
            else:
                result += "Clear calendar - good for deep work:\n\n"
            
            for i, (score, name, priority) in enumerate(scored_tasks[:10], 1):
                emoji = "🔥" if priority == "high" else "⚡" if priority == "medium" else "📌"
                result += f"{i}. {emoji} {name} [{priority.title()} priority]\n"
            
            result += f"\n{'='*60}\n"
            result += "Tip: Start with highest priority tasks when energy is highest.\n"
            
            return result
            
        except Exception as e:
            return f"Error suggesting task order: {e}"
    
    def find_duplicate_tasks(self, input_text: str) -> str:
        """Find potentially duplicate or similar tasks"""
        try:
            df = self.sheets.get_sheet_as_dataframe(
                ArborConfig.SHEETS_TRACKING['tasks']
            )
            
            if df.empty or len(df) < 2:
                return "Not enough tasks to check for duplicates."
            
            df.columns = df.columns.str.strip().str.lower()
            
            task_col = 'task' if 'task' in df.columns else 'name'
            if task_col not in df.columns:
                return "No task name column found."
            
            tasks = df[task_col].astype(str).tolist()
            
            duplicates = []
            checked = set()
            
            for i, task1 in enumerate(tasks):
                if i in checked:
                    continue
                
                task1_lower = task1.lower()
                similar_group = [task1]
                
                for j, task2 in enumerate(tasks[i+1:], start=i+1):
                    if j in checked:
                        continue
                    
                    task2_lower = task2.lower()
                    
                    if task1_lower == task2_lower or \
                       (len(task1_lower) > 10 and task1_lower in task2_lower) or \
                       (len(task2_lower) > 10 and task2_lower in task1_lower):
                        similar_group.append(task2)
                        checked.add(j)
                
                if len(similar_group) > 1:
                    duplicates.append(similar_group)
            
            if not duplicates:
                return "No duplicate tasks found!"
            
            result = f"POTENTIAL DUPLICATES ({len(duplicates)} groups)\n{'='*60}\n\n"
            
            for i, group in enumerate(duplicates, 1):
                result += f"Group {i}:\n"
                for task in group:
                    result += f" • {task}\n"
                result += "\n"
            
            result += "Consider consolidating these tasks.\n"
            
            return result
            
        except Exception as e:
            return f"Error finding duplicates: {e}"

advanced_tools = AdvancedTools(
    calendar=calendar_connector,
    sheets=sheets_connector,
    email=email_automation,
    qa_chain=qa_chain,
    vectorstore=vectorstore_manager,
    gdrive=gdrive_connector
)

print("✓ Advanced tools ready")

# ============================================================================
# ENHANCED AUTONOMOUS AGENT WITH ALL ADVANCED TOOLS
# ============================================================================

print("\n" + "="*70)
print("ENHANCED AGENT")
print("="*70)

class EnhancedAutonomousAgent:
    """Comprehensive autonomous agent with advanced capabilities"""
    
    def __init__(self, basic_tools, advanced_tools, llm):
        self.basic_tools = basic_tools
        self.advanced_tools = advanced_tools
        self.llm = llm
    
    def execute(self, query: str) -> str:
        """Universal autonomous execution engine"""
        
        print(f"\nARBOR ENHANCED AUTONOMOUS AGENT")
        print(f"{'='*70}")
        print(f"Input: {query}")
        print(f"{'='*70}\n")
        
        q = query.lower()
        
        # ====================================================================
        # CATEGORY 1: ANALYTICS & REPORTING
        # ====================================================================
        
        if any(word in q for word in ['report', 'summary', 'analyze', 'analysis']):
            print("CATEGORY: Analytics & Reporting\n")
            
            if 'productivity' in q:
                print("Generating productivity analysis...\n")
                result = self.advanced_tools.analyze_productivity(query)
                
                if 'email' in q:
                    emails = self.basic_tools._extract_emails(query)
                    if emails:
                        print(f"Emailing results to {', '.join(emails)}...\n")
                        self.basic_tools.send_email(
                            f"{','.join(emails)}|Productivity Analysis|{result}"
                        )
                
                return result
            
            else:
                result = self.advanced_tools.generate_task_report(query)
                
                if 'email' in q:
                    emails = self.basic_tools._extract_emails(query)
                    if emails:
                        subject = "Task Report"
                        if 'weekly' in q:
                            subject = "Weekly Task Report"
                        elif 'month' in q:
                            subject = "Monthly Task Report"
                        print(f"Emailing report to {', '.join(emails)}...\n")
                        self.basic_tools.send_email(
                            f"{','.join(emails)}|{subject}|{result}"
                        )
                
                return result
        
        # ====================================================================
        # CATEGORY 2: CALENDAR OPERATIONS
        # ====================================================================
        
        elif 'free' in q or 'available' in q or 'slot' in q:
            print("CATEGORY: Calendar Analysis\n")
            print("Finding free time slots...\n")
            return self.advanced_tools.find_free_slots(query)
        
        elif 'meeting hours' in q or 'how many hours' in q:
            print("CATEGORY: Meeting Analysis\n")
            print("Calculating meeting hours...\n")
            return self.advanced_tools.calculate_meeting_hours(query)
        
        elif 'meeting' in q and 'task' in q:
            print("CATEGORY: Meeting-Task Conversion\n")
            meetings = self.basic_tools.get_meetings_today()
            
            if "No meetings" not in meetings:
                print("Converting meetings to tasks...\n")
                result = self.basic_tools.meeting_to_task("")
                return f"{meetings}\n\n{result}"
            return meetings
        
        elif 'meeting' in q:
            print("CATEGORY: Calendar Query\n")
            if 'today' in q:
                return self.basic_tools.get_meetings_today()
            else:
                return self.basic_tools.get_meetings_upcoming(query)
        
        # ====================================================================
        # CATEGORY 3: DOCUMENT INTELLIGENCE
        # ====================================================================
        
        elif 'action item' in q or ('extract' in q and 'meeting' in q):
            print("CATEGORY: Document Intelligence\n")
            print("Extracting action items from documents...\n")
            return self.advanced_tools.extract_action_items(query)
        
        elif 'summarize' in q and 'document' in q:
            print("CATEGORY: Document Summary\n")
            print("Summarizing recent documents...\n")
            return self.advanced_tools.summarize_recent_documents(query)
        
        elif 'find' in q and ('mention' in q or 'document' in q):
            print("CATEGORY: Document Search\n")
            print("Searching documents...\n")
            return self.basic_tools.search_knowledge(query)
        
        # ====================================================================
        # CATEGORY 4: ADVANCED TASK FILTERING
        # ====================================================================
        
        elif 'overdue' in q:
            print("CATEGORY: Task Filtering (Overdue)\n")
            result = self.advanced_tools.filter_overdue_tasks(query)
            
            if 'email' in q:
                emails = self.basic_tools._extract_emails(query)
                if emails and 'No overdue' not in result:
                    print(f"Emailing overdue tasks to {', '.join(emails)}...\n")
                    self.basic_tools.send_email(
                        f"{','.join(emails)}|Overdue Tasks Alert|{result}"
                    )
            
            return result
        
        elif 'find tasks' in q or 'related to' in q:
            print("CATEGORY: Task Filtering (Keyword)\n")
            return self.advanced_tools.filter_tasks_by_keyword(query)
        
        # ====================================================================
        # CATEGORY 5: VISUALIZATION
        # ====================================================================
        
        elif any(word in q for word in ['chart', 'visualize', 'graph', 'distribution']):
            print("CATEGORY: Visualization\n")
            result = self.advanced_tools.create_task_visualization(query)
            
            if 'email' in q:
                emails = self.basic_tools._extract_emails(query)
                if emails:
                    print(f"📧 Emailing visualization to {', '.join(emails)}...\n")
                    self.basic_tools.send_email(
                        f"{','.join(emails)}|Task Visualization|{result}"
                    )
            
            return result
        
        # ====================================================================
        # CATEGORY 6: AI-POWERED RECOMMENDATIONS
        # ====================================================================
        
        elif 'suggest' in q or 'recommend' in q:
            print("CATEGORY: AI Recommendations\n")
            
            if 'order' in q or 'prioritize' in q or 'optimal' in q:
                print("Suggesting optimal task order...\n")
                return self.advanced_tools.suggest_task_order(query)
            
            elif 'duplicate' in q or 'similar' in q:
                print("Finding duplicate tasks...\n")
                return self.advanced_tools.find_duplicate_tasks(query)
        
        # ====================================================================
        # CATEGORY 7: EMAIL TASKS (Original functionality)
        # ====================================================================
        
        elif 'email' in q and 'task' in q:
            print("CATEGORY: Email Tasks\n")
            emails = self.basic_tools._extract_emails(query)

            if not emails:
                return "No valid email addresses found."

            print("Reading tasks from sheet...\n")
            tasks_data = self.basic_tools.read_sheet('tasks')

            if "empty" in tasks_data.lower():
                return "No tasks available to email."

            # Apply filters
            filtered_tasks = tasks_data
            filter_description = ""

            # Day of week filter
            days_of_week = {
                'monday': 0, 'mon': 0,
                'tuesday': 1, 'tue': 1, 'tues': 1,
                'wednesday': 2, 'wed': 2,
                'thursday': 3, 'thu': 3, 'thur': 3, 'thurs': 3,
                'friday': 4, 'fri': 4,
                'saturday': 5, 'sat': 5,
                'sunday': 6, 'sun': 6
            }

            target_day_num = None
            target_day_name = None

            for day_name, day_num in days_of_week.items():
                if day_name in q:
                    target_day_num = day_num
                    target_day_name = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day_num]
                    break

            if target_day_num is not None:
                filter_description = f"{target_day_name}'s"

                # Find next occurrence of this day
                today = datetime.now()
                days_ahead = (target_day_num - today.weekday()) % 7
                if days_ahead == 0 and 'next' in q:
                    days_ahead = 7
                target_date = today + timedelta(days=days_ahead)
                target_date_str = target_date.strftime('%Y-%m-%d')

                print(f"Filtering for {target_day_name} ({target_date_str})...\n")

                lines = tasks_data.split('\n')
                filtered_lines = [lines[0]] + [l for l in lines[1:] if target_date_str in l]

                if len(filtered_lines) > 1:
                    filtered_tasks = '\n'.join(filtered_lines)
                else:
                    return f"No tasks for {target_day_name} ({target_date_str})."

            elif 'tomorrow' in q:
                filter_description = "tomorrow's"
                tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
                lines = tasks_data.split('\n')
                filtered_lines = [lines[0]] + [l for l in lines[1:] if tomorrow in l]
                if len(filtered_lines) > 1:
                    filtered_tasks = '\n'.join(filtered_lines)
                else:
                    return "No tasks for tomorrow."

            elif 'today' in q:
                filter_description = "today's"
                today = datetime.now().strftime('%Y-%m-%d')
                lines = tasks_data.split('\n')
                filtered_lines = [lines[0]] + [l for l in lines[1:] if today in l]
                if len(filtered_lines) > 1:
                    filtered_tasks = '\n'.join(filtered_lines)
                else:
                    return "No tasks for today."

            elif 'high priority' in q:
                filter_description = "high priority"
                lines = tasks_data.split('\n')
                filtered_lines = [lines[0]] + [l for l in lines[1:] if 'high' in l.lower()]
                if len(filtered_lines) > 1:
                    filtered_tasks = '\n'.join(filtered_lines)
                else:
                    return "No high priority tasks."

            elif 'pending' in q:
                filter_description = "pending"
                lines = tasks_data.split('\n')
                filtered_lines = [lines[0]] + [l for l in lines[1:] if 'pending' in l.lower()]
                if len(filtered_lines) > 1:
                    filtered_tasks = '\n'.join(filtered_lines)
                else:
                    return "No pending tasks."
    
            # Send email (keep the rest as is)
            # ... continues with existing email sending code

            
            # Send email
            subject = f"Your {filter_description.title() + ' ' if filter_description else ''}Tasks"
            body = f"Here are your {filter_description + ' ' if filter_description else ''}tasks:\n\n{filtered_tasks}"
            
            print(f"Sending email to {', '.join(emails)}...\n")
            result = self.basic_tools.send_email(
                f"{','.join(emails)}|{subject}|{body}"
            )
            
            if "✓" in result:
                return f"Successfully emailed {filter_description + ' ' if filter_description else ''}tasks to {', '.join(emails)}!"
            return f"Failed: {result}"
        
        # ====================================================================
        # CATEGORY 8: SIMPLE QUERIES
        # ====================================================================
        
        elif 'task' in q and 'email' not in q:
            print("CATEGORY: Task Query\n")
            return self.basic_tools.read_sheet('tasks')
        
        elif 'time' in q or 'date' in q:
            print("CATEGORY: Time Query\n")
            return self.basic_tools.get_time()
        
        # ====================================================================
        # FALLBACK: AI-POWERED RESPONSE
        # ====================================================================
        
        else:
            print("CATEGORY: General AI Query\n")
            print("Using AI knowledge base...\n")
            return self.basic_tools.ask_ai(query)

enhanced_arbor_agent = EnhancedAutonomousAgent(
    basic_tools=comprehensive_tools,
    advanced_tools=advanced_tools,
    llm=llm
)

print("✓ Enhanced agent ready")

# ============================================================================
# NEW ARBOR_DO FUNCTION
# ============================================================================

def arbor_do(query: str) -> str:
    """
    Universal Autonomous Execution
    
    Handles ALL types of requests:
    - Analytics & Reporting
    - Calendar Intelligence
    - Document Operations
    - Advanced Filtering
    - Visualizations
    - AI Recommendations
    - Email Automation
    - And more!
    
    Examples:
        arbor_do("Generate weekly task summary and email to user@x.com")
        arbor_do("Find free time slots for 2-hour meeting this week")
        arbor_do("Extract action items from meeting notes")
        arbor_do("Email overdue tasks to manager@company.com")
        arbor_do("Suggest optimal task order for today")
        arbor_do("Analyze my productivity patterns")
    """
    
    if not enhanced_arbor_agent:
        return "Enhanced agent unavailable"
    
    print(f"\n{'='*70}")
    print(f"ARBOR ENHANCED AUTONOMOUS SYSTEM")
    print(f"{'='*70}")
    print(f"Request: {query}")
    print(f"{'='*70}\n")
    
    result = enhanced_arbor_agent.execute(query)
    
    print(f"\n{'='*70}")
    print("EXECUTION COMPLETE")
    print(f"{'='*70}\n")
    
    return result

# ============================================================================
# QUICK FUNCTIONS
# ============================================================================

def get_todays_schedule():
    """Today's meetings"""
    return comprehensive_tools.get_meetings_today()

def read_tasks():
    """All tasks"""
    return comprehensive_tools.read_sheet('tasks')

def add_task(task_name: str, status: str = "Pending", priority: str = "Medium"):
    """Add task"""
    date = datetime.now().strftime('%Y-%m-%d')
    input_text = f"tasks|{task_name}|{status}|{priority}|{date}"
    return comprehensive_tools.write_sheet(input_text)

def email_to(recipients: str, subject: str, body: str):
    """Send email"""
    input_text = f"{recipients}|{subject}|{body}"
    return comprehensive_tools.send_email(input_text)

def system_status():
    """Check status"""
    status = {
        "llm": "✓",
        "calendar": "✓" if calendar_connector.service else "✗",
        "sheets": "✓" if sheets_connector.service else "✗",
        "vectorstore": "✓" if vectorstore else "✗",
        "rag": "✓" if qa_chain else "✗",
        "agent": "✓" if enhanced_arbor_agent else "✗",
        "advanced_tools": "✓"
    }

    print("\nSYSTEM STATUS")
    print("="*40)
    for component, stat in status.items():
        print(f"  {stat} {component}")
    print("="*40)
    
    operational = sum(1 for v in status.values() if v == "✓")
    pct = (operational / len(status)) * 100
    print(f"\nOperational: {pct:.0f}%")
    
    return status

def refresh_all_data():
    """Refresh data"""
    print("\nRefreshing...")
    
    fresh = []
    fresh.extend(gdrive_connector.ingest_documents())
    fresh.extend(calendar_connector.ingest_calendar_data())
    fresh.extend(sheets_connector.ingest_sheets_data())
    
    if fresh and vectorstore:
        chunks = vectorstore_manager.text_splitter.split_documents(fresh)
        vectorstore.add_documents(chunks)
        print(f"✓ Added {len(chunks)} chunks")
    
    return f"Refreshed {len(fresh)} documents"

def search_documents(query: str, top_k: int = 5):
    """Search documents"""
    if not vectorstore:
        return "Vector store unavailable"
    
    results = vectorstore_manager.search(query, k=top_k)
    print(f"\n'{query}' - {len(results)} results:\n")
    
    for i, doc in enumerate(results, 1):
        print(f"{'─'*70}")
        print(f"Result {i}")
        print(f"Source: {doc.metadata.get('source', 'Unknown')}")
        print(f"\n{doc.page_content[:300]}...\n")
    
    return results

def arbor_help():
    """Show comprehensive help"""
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║              🌳 ARBOR ENHANCED - ULTIMATE AI SYSTEM 🌳               ║
╚══════════════════════════════════════════════════════════════════════╝

THREE MODES:

1️⃣  ASK MODE - Questions (RAG)
    ask_arbor("What should I focus on today?")
    ask_arbor("Was sind meine Aufgaben?")
    ask_arbor("What are my high priority tasks?")

2️⃣  DO MODE - Enhanced Autonomous Actions
    arbor_do("Generate weekly task report and email to user@x.com")
    arbor_do("Find free time slots for 2-hour meeting this week")
    arbor_do("Email overdue tasks to manager@company.com")
    arbor_do("Suggest optimal task order for today")
    arbor_do("Analyze my productivity patterns")
    arbor_do("Extract action items from meeting notes")
    arbor_do("Email tomorrow's tasks to user@x.com")

3️⃣  QUICK FUNCTIONS
    get_todays_schedule()        → Today's meetings
    read_tasks()                 → All tasks
    add_task("name", "status")   → Add task
    email_to("email", "subj", "body") → Send email
    system_status()              → Check health
    refresh_all_data()           → Refresh sources
    search_documents("query")    → Search knowledge

═══════════════════════════════════════════════════════════════════════
ENHANCED CAPABILITIES:
═══════════════════════════════════════════════════════════════════════

ANALYTICS & REPORTING
arbor_do("Generate weekly task summary")
arbor_do("Analyze my productivity and email to user@x.com")
arbor_do("Create monthly task report")

CALENDAR INTELLIGENCE
arbor_do("Find free time slots for 2-hour meeting this week")
arbor_do("How many hours of meetings do I have this week?")
arbor_do("Show available times tomorrow")

DOCUMENT INTELLIGENCE
arbor_do("Extract action items from meeting notes and add to tasks")
arbor_do("Summarize all documents modified this week")
arbor_do("Find documents mentioning 'budget'")

ADVANCED TASK FILTERING
arbor_do("Email overdue tasks to manager@company.com")
arbor_do("Show tasks due in next 3 days")
arbor_do("Find tasks related to 'project X'")

VISUALIZATION & INSIGHTS
arbor_do("Show task distribution by status")
arbor_do("Create visualization of tasks by priority")

AI-POWERED RECOMMENDATIONS
arbor_do("Suggest optimal task order for today")
arbor_do("Find duplicate or similar tasks")
arbor_do("Recommend tasks for this afternoon")

═══════════════════════════════════════════════════════════════════════
PRO TIPS:
═══════════════════════════════════════════════════════════════════════

✓ Natural language - Arbor understands context and intent
✓ Combine operations: "Analyze tasks and email report to user@x.com"
✓ Multiple recipients: "user1@x.com, user2@y.com"
✓ Smart filtering: "tomorrow's high priority tasks"
✓ Use context for better results

═══════════════════════════════════════════════════════════════════════
QUICK START:
═══════════════════════════════════════════════════════════════════════

Try these to see Arbor Enhanced in action:
  arbor_do("Analyze my productivity and email to ks243@snu.edu.in")
  arbor_do("Find free slots for 1-hour meeting this week")
  arbor_do("Email overdue tasks to ks243@snu.edu.in")
  arbor_do("Suggest optimal task order for today")
  system_status()

Type arbor_help() to see this again!
""")

# ============================================================================
# STARTUP COMPLETE
# ============================================================================

print("\n" + "="*70)
print("ARBOR ENHANCED SYSTEM READY")
print("="*70)

summary = f"""
Fully Integrated Enhanced AI System Operational!

Status:
  Documents: {len(all_documents)}
  Vector Store: {'✓' if vectorstore else '✗'}
  RAG (ask_arbor): {'✓' if qa_chain else '✗'}
  Enhanced Agent (arbor_do): {'✓' if enhanced_arbor_agent else '✗'}
  Calendar: {'✓' if calendar_connector.service else '✗'}
  Sheets: {'✓' if sheets_connector.service else '✗'}
  Email: ✓
  Advanced Analytics: ✓
  Document Intelligence: ✓
  AI Recommendations: ✓

Quick Start:

ASK MODE:
  ask_arbor("What are our priorities?")

ENHANCED DO MODE:
  arbor_do("Generate weekly report and email to ks243@snu.edu.in")
  arbor_do("Find free time slots for 2-hour meeting")
  arbor_do("Suggest optimal task order for today")

Type arbor_help() for complete guide! 
"""

print(summary)
print("="*70)

config_data = {
    "system": "Arbor Enhanced Autonomous AI System",
    "version": "7.0.0 - Complete with Advanced Intelligence",
    "initialized": datetime.now().isoformat(),
    "documents": len(all_documents),
    "modes": {
        "ask_mode": "RAG Q&A" if qa_chain else "unavailable",
        "do_mode": "Enhanced Autonomous Actions" if enhanced_arbor_agent else "unavailable"
    },
    "features": [
        "Advanced Analytics & Reporting",
        "Calendar Intelligence with Free Slots",
        "Document Intelligence & Action Extraction",
        "Advanced Task Filtering",
        "Task Visualization",
        "AI-Powered Recommendations",
        "Productivity Pattern Analysis",
        "Duplicate Detection",
        "Smart Task Prioritization",
        "Multi-format document support",
        "Bilingual (EN/DE)",
        "Email automation",
        "Context-aware suggestions"
    ]
}

config_path = ArborConfig.BASE_DIR / "system_config.json"
with open(config_path, 'w') as f:
    json.dump(config_data, f, indent=2)

print(f"\nConfig saved: {config_path}")
print("\n" + "="*70)
print("ARBOR ENHANCED - READY TO USE!")
print("="*70)
print("\nTry these enhanced commands:")
print('  arbor_do("Analyze my productivity and email to ks243@snu.edu.in")')
print('  arbor_do("Find free time slots for 2-hour meeting this week")')
print('  arbor_do("Suggest optimal task order for today")')
print('  arbor_do("Email overdue tasks to ks243@snu.edu.in")')
print('  ask_arbor("What should I prioritize?")')
print('  arbor_help()')
print("\n" + "="*70)