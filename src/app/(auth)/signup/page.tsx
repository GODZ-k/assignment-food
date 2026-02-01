"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Mail, Lock, Phone, User } from "lucide-react";
import z from "zod";
import { Spinner } from "@/components/ui/spinner";
import { useMutation } from "@tanstack/react-query";
import { registerAction, verifyOtpAction } from "@/actions/auth";
import { toast } from "sonner";

const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: "Name is required",
      })
      .max(50, {
        message: "Name must be less than 50 characters",
      }),
    email: z.string().trim().email({
      message: "Please enter a valid email address",
    }),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, {
        message: "Phone number must be 10 digits",
      }),
    password: z.string().trim().min(8, {
      message: "Password must be at least 8 characters",
    }),
    confirmPassword: z.string().trim(),
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const verificationFormSchema = z.object({
  pin: z.string().length(6, {
    message: "OTP must be 6 digits",
  }),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;
type VerificationFormData = z.infer<typeof verificationFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [pendingVerification, setPendingVerification] = useState(false);
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationFormSchema),
     defaultValues: {
    pin: "",
  },
  });
  const registerMutation = useMutation({
    mutationFn: async function(formData:FormData){
      const res = await registerAction(formData)
      if(!res.success){
        throw new Error(res.message)
      }
      return res
    }
  })

  const verifyMutation = useMutation({
    mutationFn:async function(formData:FormData){
      const res = await verifyOtpAction(formData)
      if(!res.success){
        throw new Error(res.message)
      }
      return res
    }
  })

  const handleRegisterSubmit = (data: RegisterFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("password", data.password);

    registerMutation.mutate(formData,{
      onSuccess:()=>{
        toast.success("Otp sent successfully")
        setPendingVerification(true);
      },
      onError:(error)=>{
        toast.error(error.message||"Something went wrong")
      }
    })
  };

  const handleVerificationSubmit = (data: VerificationFormData) => {
    const formData = new FormData();
    formData.append("pin", data.pin);
    verifyMutation.mutate(formData,{
      onSuccess:()=>{
        router.replace('/')
      },
      onError:(error)=>{
        toast.error(error.message||"Something went wrong")
      }
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Create Account
          </CardTitle>
          <CardDescription>
            {pendingVerification
              ? "Enter the OTP sent to your email"
              : "Sign up to start ordering delicious food"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {pendingVerification ? (
            // Verification Form
            <Form key={"otp-form"} {...verificationForm}>
              <form
                onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={verificationForm.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-center w-full">
                        One-Time Password
                      </FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription className="text-center">
                        Demo OTP: <code>123456</code>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={verifyMutation.isPending}
                  >
                    {verifyMutation.isPending ? <Spinner /> : "Verify Account"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            // Registration Form
            <Form key={"registration form"} {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Enter your full name"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="tel"
                            placeholder="Enter your phone number"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="Create a password"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="Confirm your password"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? <Spinner /> : "Create Account"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
