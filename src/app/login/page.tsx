"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { ToastAction } from "../../components/ui/toast";
import { useToast } from "../../hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { Toaster } from "@/components/ui/toaster";

const Login = () => {
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    email: "srfitness@gmail.com",
    password: "",
  });
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: dataUser, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      const check = await supabase.auth.getUser();

      if (!error) {
        router.push("/");
      }
      if (error) {
        toast({
          variant: "destructive",
          title: "oh No!",
          description: `${error.message}`,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Uh oh!",
        description: `${err}`,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-zinc-900">
      <div className="flex flex-col bg-white dark:bg-black shadow-md px-4 sm:px-6 md:px-8 lg:px-10 py-8 rounded-3xl w-50 max-w-md mx-5">
        <div className="font-medium self-center text-xl sm:text-3xl text-gray-800 dark:text-white dark">
          Welcome Back
        </div>
        <div className="mt-4 self-center text-xl sm:text-sm text-gray-800 dark:text-white">
          Enter your credentials to access your account
        </div>

        <form onSubmit={login} className="mt-10">
          <div className="flex flex-col mb-5">
            <label 
              htmlFor="email" 
              className="mb-1 text-xs tracking-wide text-gray-600 dark:text-white"
            >
              E-Mail Address:
            </label>
            <div className="relative">
              <div className="inline-flex items-center justify-center absolute left-0 top-0 h-full w-10 text-gray-400">
                <Mail className="text-blue-500 w-5 h-5" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                className="text-sm dark:bg-zinc-900 placeholder-gray-500 pl-10 pr-4 rounded-2xl border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="flex flex-col mb-6">
            <label 
              htmlFor="password" 
              className="mb-1 text-xs tracking-wide text-gray-600"
            >
              Password:
            </label>
            <div className="relative">
              <div className="inline-flex items-center justify-center absolute left-0 top-0 h-full w-10 text-gray-400">
                <Lock className="text-blue-500 w-5 h-5" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={data.password}
                onChange={handleChange}
                className="text-sm dark:bg-zinc-900 placeholder-gray-500 pl-10 pr-10 rounded-2xl border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-gray-400 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="text-blue-500 w-5 h-5" />
                ) : (
                  <Eye className="text-blue-500 w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="flex mt-2 items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-blue-500 hover:bg-blue-600 rounded-2xl py-2 w-full transition duration-150 ease-in"
            >
              <span className="mr-2 uppercase">
                {isLoading ? "Signing in..." : "Sign In"}
              </span>
              <span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </button>
          </div>
        </form>
      </div>
      
      <div className="flex justify-center items-center mt-6">
        <span className="text-gray-700 dark:text-white font-medium text-xs text-center">
          You don't have an account?
          <a 
            href="#" 
            className="text-xs ml-2 text-blue-500 font-semibold"
          >
            Register now
          </a>
        </span>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Login;