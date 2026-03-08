import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      console.log('Verifying email with token:', token);
      
      const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
      
      console.log('Verification response:', response.data);
      
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Verification failed. The link may be invalid or expired.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Verifying your email...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Email Verified! 🎉
                </h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Redirecting to login page in 3 seconds...
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="gradient-primary text-primary-foreground"
                >
                  Go to Login
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <XCircle className="h-16 w-16 mx-auto mb-4 text-urgent" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Verification Failed
                </h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    variant="outline"
                    className="w-full"
                  >
                    Register Again
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <Card className="glass-card p-4 border-success/20">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">
                  Welcome to FreshSave! You can now log in to your account.
                </span>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}