import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useVerifyOtp, useRequestNewOtp } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Loader, CheckCircle, ArrowLeft } from "lucide-react";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const verifyOtp = useVerifyOtp();
  const requestNewOtp = useRequestNewOtp();

  // Start countdown timer
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // If no email is provided, redirect to signup
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) return;

    await verifyOtp.mutateAsync(
      { email, otp },
      {
        onSuccess: () => {
          navigate("/dashboard");
        },
      }
    );
  };

  const handleResendOtp = async () => {
    await requestNewOtp.mutateAsync(email, {
      onSuccess: () => {
        setCountdown(30);
        setCanResend(false);
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800"
    >
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
          <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Verify your email
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          We've sent a verification code to
          <br />
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {email}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="otp"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Verification Code
          </label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            className="text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={verifyOtp.isPending || otp.trim().length !== 6}
        >
          {verifyOtp.isPending ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Verify Email
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive a code?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                disabled={requestNewOtp.isPending}
              >
                Resend code
              </button>
            ) : (
              <span>Resend code in {countdown}s</span>
            )}
          </p>
        </div>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={14} className="mr-1" />
          Back to login
        </Link>
      </div>
    </motion.div>
  );
};

export default VerifyEmail;
