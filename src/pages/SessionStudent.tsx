import { useParams } from 'react-router-dom';
import { StudentView } from '@/components/session/StudentView';

const SessionStudent = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-xl text-muted-foreground">Invalid session link</p>
      </div>
    );
  }

  return <StudentView sessionId={id} />;
};

export default SessionStudent;
