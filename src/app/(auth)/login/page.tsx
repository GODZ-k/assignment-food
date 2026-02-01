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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, Phone, MailIcon } from "lucide-react";
import z from "zod";
import { Spinner } from "@/components/ui/spinner";
import { useMutation } from "@tanstack/react-query";
import { loginAction, loginWithOtp, verifyOtpAction } from "@/actions/auth";
import { toast } from "sonner";

const emailLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().trim().min(1, "Password is required"),
});

const phoneLoginSchema = z.object({
  email: z.string().trim().email().min(1,{
    message:"Pleas emter valid email "
  }),
});

const otpVerificationSchema = z.object({
  pin: z.string().length(6, "OTP must be 6 digits"),
});

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"email" | "otp">("email");
  const [otpSent, setOtpSent] = useState(false);

  // Email login form
  const emailForm = useForm({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Phone + OTP form
  const phoneForm = useForm({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues:{
      pin:""
    }
  });

  // Mutations
  const emailLoginMutation = useMutation({
    mutationFn: async function(formData:FormData){
      const res = await loginAction(formData)
      if(!res.success){
        throw Error(res.message)
      }
      return res
    }
  });

  const sendOtpMutation = useMutation({
    mutationFn: async function(formData:FormData){
      const res = await loginWithOtp(formData)
      if(!res.success){
        throw Error(res.message)
      }
      return res
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async function(formData:FormData){
      const res = await verifyOtpAction(formData)
      if(!res.success){
        throw Error(res.message)
      }
      return res
    }
  });

  const handleEmailLogin = (data: z.infer<typeof emailLoginSchema>) => {
     const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    emailLoginMutation.mutate(formData,{
      onSuccess:()=>{
        router.replace('/')
      },
      onError:(error)=>{
        toast.error(error.message||"Something went wrong")
      }
    });
  };

  const handleSendOtp = (data: z.infer<typeof phoneLoginSchema>) => {
    const formData = new FormData();
    formData.append("email", data.email);
    sendOtpMutation.mutate(formData,{
      onSuccess:()=>{
        toast.success("OTP sent successfully. To login please enter.")
        setOtpSent(true)
      },
      onError:(error)=>{
        toast.error(error.message||"Something went wrong")
      }
    });
  };

  const handleOtpVerification = (data: z.infer<typeof otpVerificationSchema>) => {
    const formData = new FormData()
    formData.append('pin',data.pin)
    verifyOtpMutation.mutate(formData,{
      onSuccess:()=>{
        router.replace('/')
      },
      onError:(error)=>{
        toast.error(error.message||"Something went wrong")
      }
    });
  };

  return (
    <Card className="border-none shadow-xl w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Welcome Back
        </CardTitle>
        <CardDescription>Sign in to your YellowChilli account</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs
          value={loginMethod}
          onValueChange={(v) => setLoginMethod(v as "email" | "otp")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email & Password</TabsTrigger>
            <TabsTrigger value="otp">Email OTP</TabsTrigger>
          </TabsList>

          {/* Email Login Tab */}
          <TabsContent value="email" className="mt-0">
            <Form key={"login-password"} {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(handleEmailLogin)}
                className="space-y-4"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
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
                  control={emailForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter your password"
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
                  disabled={emailLoginMutation.isPending}
                >
                  {emailLoginMutation.isPending ? <Spinner /> : "Sign In"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Phone OTP Tab */}
          <TabsContent value="otp" className="mt-0">
            <Form key={"login-phone"} {...phoneForm}>
              {!otpSent ? (
                <form
                  onSubmit={phoneForm.handleSubmit(handleSendOtp)}
                  className="space-y-4"
                >
                  <FormField
                    control={phoneForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MailIcon className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={sendOtpMutation.isPending}
                  >
                    {sendOtpMutation.isPending ? <Spinner /> : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <Form key={"login-otp"} {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(handleOtpVerification)}
                    className="space-y-6"
                  >
                    <FormField
                      control={otpForm.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-center w-full">
                            Enter OTP
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
                          <FormDescription className="text-xs">
                            Demo OTP: 123456
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={verifyOtpMutation.isPending}
                    >
                      {verifyOtpMutation.isPending ? <Spinner /> : "Verify & Sign In"}
                    </Button>
                  </form>
                </Form>
              )}
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 justify-center">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline text-center"
        >
          Forgot your password?
        </Link>
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
