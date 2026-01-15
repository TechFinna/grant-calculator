import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProgramCard } from "@/components/program-card";
import { FundingChart } from "@/components/funding-chart";
import { PROGRAMS, Program } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import { AlertCircle, Download, Share2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Results() {
  const [matches, setMatches] = useState<Program[]>([]);
  const [scenario, setScenario] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate calculation delay
    const timer = setTimeout(() => {
      // In a real app, we'd use the calculator data to filter
      // For POC, we just pick some "relevant" ones
      setMatches(PROGRAMS);
      setScenario([PROGRAMS[0], PROGRAMS[2]]); // Default scenario
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const addToScenario = (program: Program) => {
    if (!scenario.find(p => p.id === program.id)) {
      setScenario([...scenario, program]);
    }
  };

  const removeFromScenario = (id: string) => {
    setScenario(scenario.filter(p => p.id !== id));
  };

  const totalFunding = scenario.reduce((acc, p) => acc + p.fundingMax, 0);
  const chartData = scenario.map((p, i) => ({
    name: p.name.split(" - ")[0],
    value: p.fundingMax || 50000, // Fallback for uncapped
    color: i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))" 
  }));

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse space-y-4 max-w-lg mx-auto">
            <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-slate-200 rounded mt-8"></div>
          </div>
          <h2 className="text-xl font-semibold mt-8 text-slate-600">Analyzing 45+ funding programs...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen pb-20">
        
        {/* Top Summary Banner */}
        <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Your Funding Estimate</h1>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">High Confidence</Badge>
                  <span className="text-slate-500">Based on provided data</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Potential Funding</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalFunding)}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[1fr_400px] gap-8">
          
          {/* Main Content: Matches */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Best Matches <span className="text-sm font-normal text-muted-foreground bg-white px-2 py-0.5 rounded-full border">Top 5</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {matches.map((program) => (
                  <ProgramCard 
                    key={program.id} 
                    program={program} 
                    relevance="High" 
                    onAddToScenario={addToScenario}
                    added={!!scenario.find(p => p.id === program.id)}
                  />
                ))}
              </div>
            </section>

            <section className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="bg-blue-100 p-2 rounded-full h-fit text-blue-700">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Stacking Rule Warning</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    You typically cannot combine federal and provincial grants to cover more than 75% of a single expense.
                  </p>
                  <Link href="/how-it-works" className="text-sm font-medium text-blue-700 underline hover:text-blue-900">
                    Learn how stacking works
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar: Scenario Builder */}
          <div className="space-y-6">
            <Card className="sticky top-40 border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-900 text-white py-4">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Selected Scenario
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="chart" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 rounded-none bg-slate-100 p-1">
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-4 bg-white min-h-[300px]">
                    <TabsContent value="list" className="mt-0 space-y-3">
                      {scenario.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">No programs selected.</p>
                      ) : (
                        scenario.map(p => (
                          <div key={p.id} className="flex justify-between items-center text-sm group">
                            <span className="truncate max-w-[180px] font-medium">{p.name.split(" - ")[0]}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 font-mono">{formatCurrency(p.fundingMax || 50000)}</span>
                              <button 
                                onClick={() => removeFromScenario(p.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {scenario.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <div className="flex justify-between items-center font-bold">
                            <span>Total</span>
                            <span className="text-primary">{formatCurrency(totalFunding)}</span>
                          </div>
                        </>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="chart" className="mt-0 h-[250px]">
                      {scenario.length > 0 ? (
                        <FundingChart data={chartData} />
                      ) : (
                         <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Add programs to see chart</div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
                
                <div className="p-4 bg-slate-50 border-t space-y-3">
                  <h4 className="font-semibold text-sm text-slate-900">Next Steps</h4>
                  <ul className="space-y-2">
                    {[
                      "Download PDF Summary",
                      "Contact Investissement Québec",
                      "Prepare Financial Statements"
                    ].map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] bg-white text-slate-400">
                          {i + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-2">Export Plan <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
