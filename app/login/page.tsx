'use client';

import { createClient } from '@/app/lib/supabase/client'; // Importa o cliente para Client Components
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Container } from '@/app/components/ui/Container';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/app/components/ui/Alert';

export default function LoginPage() {
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redireciona de volta para a origem após o callback do Google
        // O callback em si redirecionará para a página correta
        redirectTo: `${window.location.origin}/auth/callback`,
        // Opcional: Escopos adicionais se necessário
        // scopes: 'https://www.googleapis.com/auth/calendar.readonly',
      },
    });

    if (error) {
      console.error('Google Login Error:', error);
      setError(`Erro ao iniciar login com Google: ${error.message}`);
      setLoading(false);
    }
    // Se não houver erro, o Supabase redirecionará o usuário para o Google
  };

  return (
    <Container className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        {error && (
          <Alert variant="error" title="Erro no Login" className="mb-4">
            {error}
          </Alert>
        )}
        <Button
          onClick={handleGoogleLogin}
          className="w-full"
          disabled={loading}
          icon={<LogIn size={16} />}
        >
          {loading ? 'Redirecionando...' : 'Entrar com Google'}
        </Button>
        {/* Adicionar outros métodos de login aqui se necessário */}
      </Card>
    </Container>
  );
}