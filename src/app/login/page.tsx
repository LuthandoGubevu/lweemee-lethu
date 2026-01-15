'use client';

import { useState } from 'react';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  UserCredential,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import Step1AccountDetails from '@/components/signup/step1-account-details';
import Step2BusinessDetails from '@/components/signup/step2-business-details';
import Step3ServiceSelection from '@/components/signup/step3-service-selection';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const { user: existingUser, loading } = useUser();
  const firestore = useFirestore();

  if (loading) return <div>Loading...</div>;
  if (existingUser) {
    router.push('/dashboard');
    return null;
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      if (firestore && googleUser) {
        const userRef = doc(firestore, 'users', googleUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists() || !userDoc.data()?.onboardingComplete) {
            // New user or incomplete onboarding
             await setDoc(userRef, {
                uid: googleUser.uid,
                email: googleUser.email,
                displayName: googleUser.displayName,
                photoURL: googleUser.photoURL,
                createdAt: serverTimestamp(),
                source: 'google',
            }, { merge: true });
            setUser(googleUser);
            setStep(2); // Go to step 2
        } else {
            // Existing user, go to dashboard
            router.push('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message,
      });
    }
  };

  const nextStep = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };
  
  const handleUserCreated = (user: User, data: any) => {
      setUser(user);
      nextStep(data);
  }

  const finalSubmit = async (data: any) => {
    const finalData = { ...formData, ...data };

    if (!firestore || !user) {
        toast({ title: "Error", description: "User session not found.", variant: "destructive"});
        return;
    }

    try {
        const userRef = doc(firestore, 'users', user.uid);
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: (finalData as any).fullName || user.displayName,
            profile: {
                businessName: (finalData as any).businessName,
                role: (finalData as any).role,
                industry: (finalData as any).industry,
                country: (finalData as any).country,
                teamSize: (finalData as any).teamSize,
                websiteOrInstagram: (finalData as any).websiteOrInstagram,
            },
            serviceIntent: {
                type: (finalData as any).serviceType,
                managesMultipleBrands: (finalData as any).managesMultipleBrands,
                brandCount: (finalData as any).brandCount,
                supportType: (finalData as any).supportType,
                mainGoal: (finalData as any).mainGoal,
                contactMethod: (finalData as any).contactMethod,
            },
            onboardingComplete: true,
            updatedAt: serverTimestamp(),
        }

        await setDoc(userRef, userData, { merge: true });

        toast({ title: "Welcome to Lweemee!", description: "Your account has been created."});
        
        // Routing logic
        const serviceType = (finalData as any).serviceType;
        if (serviceType === 'platform' || serviceType === 'both') {
            router.push('/dashboard/workspaces/new');
        } else if (serviceType === 'strategist') {
            // Assuming no /book-demo page exists, redirect to dashboard for now
            router.push('/dashboard'); 
        } else {
             router.push('/dashboard');
        }

    } catch (error: any) {
        toast({ title: "An error occurred", description: error.message, variant: 'destructive'})
    }

  };

  const steps = [
    {
      title: 'Create Your Account',
      description: 'Get started with Lweemee in a few simple steps.',
      step: 1,
      component: <Step1AccountDetails onNext={handleUserCreated} onGoogleSignIn={handleGoogleSignIn} />,
    },
    {
      title: 'Tell Us About Your Business',
      description: "This helps us tailor your experience.",
      step: 2,
      component: <Step2BusinessDetails onNext={nextStep} onBack={prevStep} />,
    },
    {
      title: 'What Are You Looking For?',
      description: 'Choose the service that best fits your needs.',
      step: 3,
      component: <Step3ServiceSelection onBack={prevStep} onSubmit={finalSubmit} />,
    },
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Step {step} of {steps.length}</p>
          <CardTitle className="text-2xl font-headline">
            {currentStepData.title}
          </CardTitle>
          <CardDescription>
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        <CardContent>{currentStepData.component}</CardContent>
      </Card>
    </div>
  );
}
