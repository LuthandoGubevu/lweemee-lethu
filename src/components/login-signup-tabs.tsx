
'use client';

import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Step1AccountDetails from '@/components/signup/step1-account-details';
import { LoginForm } from '@/components/login-form';
import type { User } from 'firebase/auth';

type LoginSignupTabsProps = {
    onUserCreated: (user: User, data: any) => void;
    onLogin: (data: any) => void;
    onGoogleSignIn: () => void;
};

export function LoginSignupTabs({ onUserCreated, onLogin, onGoogleSignIn }: LoginSignupTabsProps) {
    const searchParams = useSearchParams();
    const action = searchParams.get('action');

    const defaultTab = action === 'login' ? 'login' : 'signup';

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="login">Log In</TabsTrigger>
            </TabsList>
            <TabsContent value="signup">
                <Step1AccountDetails onNext={onUserCreated} onGoogleSignIn={onGoogleSignIn} />
            </TabsContent>
            <TabsContent value="login">
                <LoginForm onLogin={onLogin} onGoogleSignIn={onGoogleSignIn} />
            </TabsContent>
        </Tabs>
    );
}
