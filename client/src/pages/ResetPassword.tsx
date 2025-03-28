import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useResetPassword } from "../hooks/useAuth";
import Button from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import Input from "../components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Loader, Lock } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;

    await resetPassword.mutateAsync(
      { token, password: data.password },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        },
      }
    );
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
          <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Set new password
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Create a strong password for your TaskNest account
        </p>
      </div>

      <Form onSubmit={form.handleSubmit(onSubmit)} {...form}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
    
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Reset Password
          </Button>
      </Form>

      {resetPassword.isSuccess && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30"
        >
          <p className="text-sm text-green-800 dark:text-green-300">
            Password reset successfully! Redirecting you to login...
          </p>
        </motion.div>
      )}

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

export default ResetPassword;
