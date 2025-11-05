import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { waitlistSchema, type WaitlistFormData } from "@/lib/validations/waitlist";
import { useWaitlist } from "@/hooks/use-waitlist";
import { Loader2 } from "lucide-react";

interface WaitlistFormProps {
  onSuccess: (position: number, referralCode: string) => void;
  referralCode?: string;
}

export const WaitlistForm = ({ onSuccess, referralCode }: WaitlistFormProps) => {
  const { joinWaitlist, isLoading } = useWaitlist();
  const [utmParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    };
  });

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company_name: "",
      monthly_revenue: "",
      main_challenge: "",
      terms_accepted: false,
      referred_by: referralCode || "",
    },
  });

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      const { terms_accepted, ...submitData } = data;
      const result = await joinWaitlist.mutateAsync({
        name: submitData.name,
        email: submitData.email,
        phone: submitData.phone,
        main_challenge: submitData.main_challenge,
        company_name: submitData.company_name,
        monthly_revenue: submitData.monthly_revenue,
        referred_by: submitData.referred_by,
        ...utmParams,
      });
      
      if (result) {
        onSuccess(result.position, result.referral_code);
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder="João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="joao@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp *</FormLabel>
              <FormControl>
                <PhoneInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Minha Empresa Ltda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthly_revenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faturamento Mensal</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma faixa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-10k">Até R$ 10.000</SelectItem>
                  <SelectItem value="10k-50k">R$ 10.000 - R$ 50.000</SelectItem>
                  <SelectItem value="50k-100k">R$ 50.000 - R$ 100.000</SelectItem>
                  <SelectItem value="100k-500k">R$ 100.000 - R$ 500.000</SelectItem>
                  <SelectItem value="500k+">Acima de R$ 500.000</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="main_challenge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qual seu principal desafio financeiro? *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Conte-nos o que mais te tira o sono nas finanças..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms_accepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Aceito receber comunicações sobre o lançamento e concordo com os termos de uso *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
          Garantir Minha Vaga na Fila
        </Button>
      </form>
    </Form>
  );
};
