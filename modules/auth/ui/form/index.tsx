"use client";

import { appToast } from "@/components/custom/app-toast";
import { PasswordInput } from "@/components/custom/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/lib/auth-client";
import { LoginFormValues, loginSchema } from "@/lib/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type AuthFormProps = {
    variant: "login";
};

// ────────────────────────────────────────────
// Config per variant
// ────────────────────────────────────────────
const variantConfig = {
    login: {
        title: "SIGN IN TO YOUR ACCOUNT",
        description: "Enter your email and password to access the app",
        submitLabel: "Sign In",
    },
} as const;

// ────────────────────────────────────────────
// AuthForm
// ────────────────────────────────────────────
export const AuthForm = ({ variant }: AuthFormProps) => {
    const config = variantConfig[variant];

    const router = useRouter();
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setError(undefined);

        const loginValues = values as LoginFormValues;
        await signIn.email(
            {
                email: loginValues.email,
                password: loginValues.password,
                rememberMe: loginValues.remember ?? true,
                callbackURL: "/",
            },
            {
                onRequest: () => setLoading(true),
                onSuccess: () => {
                    setLoading(false);
                    appToast.success("Successfully logged in!");
                    router.push("/admin");
                },
                onError: ctx => {
                    setLoading(false);
                    setError(ctx.error.message);
                    appToast.error(`${ctx.error.message}`);
                },
                onSettled: () => setLoading(false),
            },
        );
    };

    return (
        <Card className="w-full max-w-lg border-none shadow-none bg-transparent">
            <CardHeader>
                <CardTitle className="text-xl font-bold">{config.title}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name field — register only */}

                        {/* Email field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email address" {...field} disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Enter your password"
                                            required
                                            disabled={loading}
                                            showRules
                                            showStrength
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Spinner /> : config.submitLabel}
                        </Button>

                        <p className="text-sm text-center text-muted-foreground">Please login to your account</p>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
