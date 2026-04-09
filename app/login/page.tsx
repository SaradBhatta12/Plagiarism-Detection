"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation, useRegisterMutation } from "@/app/store/api/apiSlice";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/app/store/features/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();
      if (result.success) {
        dispatch(setCredentials({ user: result.user, token: result.accessToken }));
        toast({
          title: "Sign In Successful",
          description: `Welcome back, ${result.user.name}!`,
        });
        router.push("/");
      }
    } catch (err: any) {
      toast({
        title: "Sign In Failed",
        description: err?.data?.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await register({ name, email, password, role }).unwrap();
      if (result.success) {
        toast({
          title: "Account Created",
          description: "Your registration was successful. You can now sign in.",
        });
        // Optionally switch to login tab
      }
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err?.data?.message || "An error occurred during account creation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md shadow-2xl border bg-white/50 backdrop-blur-xl">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <TabsList className="grid w-80 grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Access your plagiarism detection portal
            </CardDescription>
          </CardHeader>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 border"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-900 text-slate-50 hover:bg-slate-800 transition-all font-bold group"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Full Name
                  </Label>
                  <Input
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Password
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    I am a...
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-11 border">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-900 text-slate-50 hover:bg-slate-800 transition-all font-bold group"
                  disabled={isRegisterLoading}
                >
                  {isRegisterLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}