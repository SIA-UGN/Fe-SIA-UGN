import LoginForm from '@/components/ui/loginform';
import Footer from '@/components/ui/footer';

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{
        fontFamily: 'Urbanist',
        backgroundImage: 'url(/BGLogin.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex-1">
        <LoginForm />
      </div>
      <Footer />
    </div>
  );
}