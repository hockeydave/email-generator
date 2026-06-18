import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Sparkles, Copy, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { generateEmail } from "@/lib/generate-email.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cold Email Generator — Tailored outreach in seconds" },
      {
        name: "description",
        content:
          "Generate a personalized cold email for any business in seconds. Enter the business name, industry, city, and tone.",
      },
      { property: "og:title", content: "Cold Email Generator" },
      {
        property: "og:description",
        content:
          "Generate a personalized cold email for any business in seconds — name, industry, city, tone.",
      },
    ],
  }),
  component: Index,
});

const FormSchema = z.object({
  businessName: z.string().trim().min(1, "Required").max(120),
  industry: z.string().trim().min(1, "Required").max(120),
  city: z.string().trim().min(1, "Required").max(120),
  tone: z.enum(["Professional", "Friendly", "Casual", "Persuasive", "Witty"]),
});
type FormValues = z.infer<typeof FormSchema>;

const TONES: FormValues["tone"][] = [
  "Professional",
  "Friendly",
  "Casual",
  "Persuasive",
  "Witty",
];

function Index() {
  const generate = useServerFn(generateEmail);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      businessName: "",
      industry: "",
      city: "",
      tone: "Professional",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setEmail("");
    try {
      const result = await generate({ data: values });
      setEmail(result.email);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(email);
    toast.success("Copied to clipboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/40 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            AI lead email generator for web design agencies.&nbsp;
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tailored outreach for any business — in seconds.
          </p>
        </header>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Tell us about the prospect</CardTitle>
            <CardDescription>
              The more specific you are, the better the email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  placeholder="e.g. Acme Coffee Roasters"
                  {...form.register("businessName")}
                />
                {form.formState.errors.businessName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.businessName.message}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g. Specialty coffee"
                    {...form.register("industry")}
                  />
                  {form.formState.errors.industry && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.industry.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Austin"
                    {...form.register("city")}
                  />
                  {form.formState.errors.city && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone of email</Label>
                <Select
                  defaultValue={form.getValues("tone")}
                  onValueChange={(v) => form.setValue("tone", v as FormValues["tone"])}
                >
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Email
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {email && (
          <Card className="mt-6 border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Your email</CardTitle>
                <CardDescription>Review, tweak, then send.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={copy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-sans text-sm leading-relaxed text-foreground">
                {email}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </main>
  );
}
