import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useAuth";
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
import { ArrowLeft, Loader, Mail } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await forgotPassword.mutateAsync(data.email);
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
          <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Reset your password
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Enter your email address and we'll send you instructions to reset your
          password
        </p>
      </div>

      <Form onSubmit={form.handleSubmit(onSubmit)} {...form} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
  
          <Button
            type="submit"
            className="w-full"
            disabled={forgotPassword.isPending}
          >
            {forgotPassword.isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Send Reset Instructions
          </Button>
      </Form>

      {forgotPassword.isSuccess && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30"
        >
          <p className="text-sm text-green-800 dark:text-green-300">
            If an account exists with that email, we've sent reset instructions.
            Please check your inbox.
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

export default ForgotPassword;
