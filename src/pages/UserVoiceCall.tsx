import UserCall from './UserCall';

export default function UserVoiceCall() {
    // Always show selection screen first (not auto-call)
    // This ensures AudioContext is created during a real user gesture
    return <UserCall />;
}
