import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, Trash2, Plus, HelpCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/router";

// Types for the form data
interface CalculatorData {
  // Step A: Business Profile
  location: string;
  industry: string;
  employees: string;
  revenue: string;
  isExporting: boolean;
  
  // Step B: Project Overview
  projectTypes: string[];
  timeline: string;
  description: string;
  
  // Step C: Budget
  budgetItems: Array<{ id: string; name: string; cost: number }>;
  
  // Step D: Preferences
  supportType: string;
  reimbursementOk: boolean;
  hasProjectManager: boolean;
}

const INITIAL_DATA: CalculatorData = {
  location: "",
  industry: "",
  employees: "",
  revenue: "",
  isExporting: false,
  projectTypes: [],
  timeline: "",
  description: "",
  budgetItems: [
    { id: "1", name: "Software Licenses (ERP/CRM)", cost: 0 },
    { id: "2", name: "Implementation Consultants", cost: 0 },
    { id: "3", name: "Training", cost: 0 },
  ],
  supportType: "any",
  reimbursementOk: true,
  hasProjectManager: false,
};

const STEPS = ["Business Profile", "Project Overview", "Budget", "Preferences", "Review"];

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<CalculatorData>(INITIAL_DATA);
  const router = useRouter();


  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("qc-funding-calc");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved progress");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("qc-funding-calc", JSON.stringify(data));
  }, [data]);

  const updateData = (updates: Partial<CalculatorData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Submit
      router.push("/results");

    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const totalBudget = data.budgetItems.reduce((acc, item) => acc + item.cost, 0);

  // Validation Logic (Simple)
  const isStepValid = () => {
    switch (currentStep) {
      case 0: return !!data.location && !!data.industry && !!data.employees;
      case 1: return data.projectTypes.length > 0 && !!data.timeline;
      case 2: return totalBudget > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header & Progress */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Funding Calculator</h1>
              <p className="text-slate-500 text-sm">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-48">
                <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Auto-saved</span>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[250px_1fr] gap-8">
            {/* Sidebar Steps */}
            <nav className="hidden lg:block space-y-1">
              {STEPS.map((step, i) => (
                <button
                  key={i}
                  disabled={i > currentStep}
                  onClick={() => setCurrentStep(i)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between",
                    i === currentStep ? "bg-white shadow-sm text-primary border border-slate-200" : 
                    i < currentStep ? "text-slate-600 hover:bg-slate-100" : "text-slate-400 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
                      i === currentStep ? "bg-primary text-white border-primary" :
                      i < currentStep ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                      "bg-slate-100 text-slate-400 border-slate-200"
                    )}>
                      {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    {step}
                  </div>
                </button>
              ))}
            </nav>

            {/* Main Form Area */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 md:p-8 min-h-[500px]">
                
                {/* STEP A: BUSINESS PROFILE */}
                {currentStep === 0 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Region in Québec</Label>
                        <Select value={data.location} onValueChange={(v) => updateData({ location: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="montreal">Montréal (Greater Area)</SelectItem>
                            <SelectItem value="quebec_city">Québec City</SelectItem>
                            <SelectItem value="regions">Other Regions (Resource Regions)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Some grants offer higher rates for regions outside Montréal/Québec City.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Industry</Label>
                          <Select value={data.industry} onValueChange={(v) => updateData({ industry: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="tech">Information Technology</SelectItem>
                              <SelectItem value="retail">Retail / Wholesale</SelectItem>
                              <SelectItem value="construction">Construction</SelectItem>
                              <SelectItem value="services">Professional Services</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Employees (FTE)</Label>
                          <Select value={data.employees} onValueChange={(v) => updateData({ employees: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-5">1-5</SelectItem>
                              <SelectItem value="6-49">6-49</SelectItem>
                              <SelectItem value="50-99">50-99</SelectItem>
                              <SelectItem value="100-499">100-499</SelectItem>
                              <SelectItem value="500+">500+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Annual Revenue</Label>
                        <Select value={data.revenue} onValueChange={(v) => updateData({ revenue: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select revenue range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<500k">Less than $500k</SelectItem>
                            <SelectItem value="500k-2m">$500k - $2M</SelectItem>
                            <SelectItem value="2m-10m">$2M - $10M</SelectItem>
                            <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                            <SelectItem value="50m+">$50M+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox 
                          id="exporting" 
                          checked={data.isExporting}
                          onCheckedChange={(c) => updateData({ isExporting: c === true })}
                        />
                        <Label htmlFor="exporting" className="font-normal cursor-pointer">
                          We currently export (or plan to export) outside Québec
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP B: PROJECT OVERVIEW */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <Label className="text-base">What type of project are you planning?</Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          "ERP Implementation",
                          "Cybersecurity Upgrade",
                          "Industry 4.0 / Automation",
                          "Digital Marketing / eCommerce",
                          "Custom Software Development",
                          "Data Analytics / AI"
                        ].map((type) => (
                          <div key={type} className={cn(
                            "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all",
                            data.projectTypes.includes(type) 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          )}
                          onClick={() => {
                            const newTypes = data.projectTypes.includes(type)
                              ? data.projectTypes.filter(t => t !== type)
                              : [...data.projectTypes, type];
                            updateData({ projectTypes: newTypes });
                          }}
                          >
                            <Checkbox 
                              checked={data.projectTypes.includes(type)}
                              className="mt-0.5"
                            />
                            <div className="space-y-1">
                              <span className="font-medium text-sm">{type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Project Timeline</Label>
                      <RadioGroup value={data.timeline} onValueChange={(v) => updateData({ timeline: v })}>
                        <div className="flex gap-4 flex-wrap">
                          {["0-3 months", "3-6 months", "6-12 months", "12+ months"].map((t) => (
                            <div key={t} className="flex items-center space-x-2">
                              <RadioGroupItem value={t} id={t} />
                              <Label htmlFor={t} className="font-normal cursor-pointer">{t}</Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Brief Description (Optional)</Label>
                      <Input 
                        placeholder="e.g. Replacing legacy Excel sheets with a cloud ERP..." 
                        value={data.description}
                        onChange={(e) => updateData({ description: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* STEP C: BUDGET */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-base">Estimated Project Budget</Label>
                      <Badge variant="outline" className="text-lg px-3 py-1 bg-slate-50">
                        Total: <span className="font-bold text-primary ml-2">{formatCurrency(totalBudget)}</span>
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {data.budgetItems.map((item, index) => (
                        <div key={item.id} className="flex gap-3 items-end group">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">Item Name</Label>
                            <Input 
                              value={item.name} 
                              onChange={(e) => {
                                const newItems = [...data.budgetItems];
                                newItems[index].name = e.target.value;
                                updateData({ budgetItems: newItems });
                              }}
                            />
                          </div>
                          <div className="w-40 space-y-1">
                            <Label className="text-xs text-muted-foreground">Estimated Cost ($)</Label>
                            <Input 
                              type="number" 
                              value={item.cost || ""} 
                              onChange={(e) => {
                                const newItems = [...data.budgetItems];
                                newItems[index].cost = parseFloat(e.target.value) || 0;
                                updateData({ budgetItems: newItems });
                              }}
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newItems = data.budgetItems.filter((_, i) => i !== index);
                              updateData({ budgetItems: newItems });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 border-dashed"
                        onClick={() => {
                          updateData({ 
                            budgetItems: [
                              ...data.budgetItems, 
                              { id: Math.random().toString(), name: "New Item", cost: 0 }
                            ] 
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Line Item
                      </Button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mt-6 flex gap-3 text-sm text-blue-800">
                      <HelpCircle className="h-5 w-5 shrink-0" />
                      <p>
                        <strong>Tip:</strong> Be realistic but optimistic. Grants often cover a percentage of <em>eligible</em> expenses. Don't forget training and internal salaries!
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP D: PREFERENCES */}
                {currentStep === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <Label className="text-base">What kind of support do you prefer?</Label>
                      <RadioGroup value={data.supportType} onValueChange={(v) => updateData({ supportType: v })}>
                        <div className="grid md:grid-cols-3 gap-4">
                          {[
                            { id: "grants", label: "Non-repayable Grants", desc: "Best value, higher competition." },
                            { id: "loans", label: "Interest-free Loans", desc: "Easier to get, must repay." },
                            { id: "tax", label: "Tax Credits", desc: "Guaranteed if eligible, paid later." },
                            { id: "any", label: "Any / Optimized Mix", desc: "We'll find the best combo." }
                          ].map((opt) => (
                            <div key={opt.id} className="relative">
                              <RadioGroupItem value={opt.id} id={opt.id} className="peer sr-only" />
                              <Label 
                                htmlFor={opt.id}
                                className="flex flex-col p-4 border rounded-lg cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-slate-50 h-full"
                              >
                                <span className="font-semibold mb-1">{opt.label}</span>
                                <span className="text-xs text-muted-foreground font-normal">{opt.desc}</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="reimbursement" 
                          checked={data.reimbursementOk}
                          onCheckedChange={(c) => updateData({ reimbursementOk: c === true })}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="reimbursement" className="font-medium">
                            Can you pay upfront and be reimbursed later?
                          </Label>
                          <p className="text-sm text-muted-foreground">Most government grants work on a reimbursement basis (you pay, then claim).</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP E: REVIEW */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-bold">Review your details</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="pt-6 space-y-4">
                          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Company</h3>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <span className="text-slate-500">Industry:</span>
                            <span className="font-medium capitalize">{data.industry}</span>
                            <span className="text-slate-500">Region:</span>
                            <span className="font-medium capitalize">{data.location.replace('_', ' ')}</span>
                            <span className="text-slate-500">Size:</span>
                            <span className="font-medium">{data.employees} employees</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6 space-y-4">
                          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Project</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Total Budget:</span>
                              <span className="font-bold text-primary">{formatCurrency(totalBudget)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block mb-1">Focus Areas:</span>
                              <div className="flex flex-wrap gap-1">
                                {data.projectTypes.map(t => (
                                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox id="disclaimer" />
                        <Label htmlFor="disclaimer" className="text-sm">
                          I understand this tool provides estimates based on public data and is not a formal application.
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <div className="p-6 border-t bg-slate-50/50 flex justify-between rounded-b-xl">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                  className="w-24"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                
                <Button 
                  onClick={nextStep} 
                  disabled={!isStepValid()}
                  className={cn("w-32", currentStep === STEPS.length - 1 && "bg-emerald-600 hover:bg-emerald-700")}
                >
                  {currentStep === STEPS.length - 1 ? "Calculate" : "Next"}
                  {currentStep !== STEPS.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
