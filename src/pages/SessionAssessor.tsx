import { useParams, Navigate } from 'react-router-dom';
import { AssessorCockpit } from '@/components/session/AssessorCockpit';

const SessionAssessor = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AssessorCockpit sessionId={id} />;
};

export default SessionAssessor;
