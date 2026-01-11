import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQ_ITEMS } from "@/data/plans";

export function PlansFAQ() {
  return (
    <Card>
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-lg md:text-xl">Perguntas Frequentes</CardTitle>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-sm md:text-base py-3 md:py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
