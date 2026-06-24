import { createFileRoute } from "@tanstack/react-router";
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
      { title: "AI Lead Email Generator — Tailored outreach in seconds" },
      {
        name: "description",
        content:
          "Generate a personalized cold email for any business in seconds. Enter the business name, industry, city, and tone.",
      },
      { property: "og:title", content: "AI Lead Email Generator" },
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

interface ParsedEmail {
  subject: string;
  body: string;
}

function parseEmail(email: string): ParsedEmail {
  const lines = email.split("\n");
  let subject = "";
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith("subject:")) {
      subject = line.replace(/^subject:\s*/i, "").trim();
      bodyStart = i + 1;
      break;
    }
  }

  // Skip blank lines after subject to find body start
  while (bodyStart < lines.length && lines[bodyStart].trim() === "") {
    bodyStart++;
  }

  const body = lines.slice(bodyStart).join("\n").trim();
  return { subject, body };
}

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

  const parsed = email ? parseEmail(email) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">LeadMail AI</span>
          </div>
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">For web design agencies</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        {/* Hero */}
        <section className="mb-10 text-center sm:mb-14">
          <span className="mb-4 inline-flex items-center rounded-full border border-border/60 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Personalized outreach in seconds
          </span>
          <h1 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            AI lead email generator for web design agencies.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            Generate outreach emails that convert in seconds
          </p>
        </section>

        {/* Form section */}
        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <Card className="border border-border/60 bg-card shadow-lg shadow-muted/20">
                <CardHeader className="space-y-1 px-6 pb-4 pt-6">
                  <CardTitle className="text-lg font-semibold">Prospect details</CardTitle>
                  <CardDescription className="text-sm">
                    Specific details create a more personalized email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
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

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
            </div>
          </div>

          {/* Result section */}
          <div className="lg:col-span-7">
            {parsed ? (
              <Card className="h-full border border-border/60 bg-card shadow-lg shadow-muted/20">
                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-muted/30 px-6 py-5">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">Generated email</CardTitle>
                    <CardDescription className="text-sm">
                      Review, edit, then copy into your outreach tool.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={copy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </CardHeader>
                <CardContent className="px-6 py-8">
                  {parsed.subject && (
                    <div className="mb-8">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Subject line
                      </span>
                      <p className="text-lg font-semibold text-foreground">{parsed.subject}</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email body
                    </span>
                    <div className="prose prose-sm max-w-none text-foreground">
                      {parsed.body.split("\n\n").map((paragraph, i) => (
                        <p key={i} className="leading-relaxed text-foreground/90">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 py-12 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">Your email will appear here</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Fill out the form and click Generate Email to create a personalized outreach message.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Toaster />
    </div>
  );
}
