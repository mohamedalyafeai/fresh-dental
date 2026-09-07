import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { DoctorWorkspace } from '@/components/admin/DoctorWorkspace';

const DoctorWorkspacePage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [isLoading, user, navigate]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">صفحة الطبيب</h1>
              <p className="text-sm text-muted-foreground">
                المرضى المحجوزون لديك ورفع تقارير العلاج
              </p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/admin')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            رجوع للوحة التحكم
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isAdmin ? (
          <p className="text-muted-foreground">هذه الصفحة مخصصة لفريق العيادة.</p>
        ) : (
          <DoctorWorkspace />
        )}
      </main>
    </div>
  );
};

export default DoctorWorkspacePage;
