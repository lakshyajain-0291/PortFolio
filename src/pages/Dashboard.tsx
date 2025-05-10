import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Github, Linkedin, FileText, Brain, RefreshCw, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import portfolioApi from '@/lib/api';

export default function Dashboard() {
  const [loading, setLoading] = useState({
    github: false,
    resume: false,
    linkedin: false,
    insights: false
  });
  const [portfolio, setPortfolio] = useState<any>(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for LinkedIn auth callback results
  useEffect(() => {
    const linkedinStatus = searchParams.get('linkedin');
    if (linkedinStatus === 'success') {
      toast({
        title: 'LinkedIn Connected',
        description: 'Your LinkedIn profile data has been imported successfully.',
      });
    } else if (linkedinStatus === 'error') {
      toast({
        variant: 'destructive',
        title: 'LinkedIn Connection Error',
        description: 'There was a problem connecting to LinkedIn.',
      });
    }
    
    // Load portfolio data
    fetchPortfolio();
  }, [searchParams]);

  const fetchPortfolio = async () => {
    try {
      const data = await portfolioApi.getPortfolio();
      setPortfolio(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load portfolio data',
      });
    }
  };

  const handleGithubImport = async () => {
    if (!githubUsername) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a GitHub username',
      });
      return;
    }

    setLoading(prev => ({ ...prev, github: true }));
    try {
      await portfolioApi.updateFromGitHub(githubUsername);
      toast({
        title: 'GitHub Data Imported',
        description: 'Your GitHub repositories and profile data have been processed successfully.',
      });
      fetchPortfolio();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Import Error',
        description: 'Failed to import GitHub data.',
      });
    } finally {
      setLoading(prev => ({ ...prev, github: false }));
    }
  };

  const handleLinkedInUpdate = async () => {
    if (!linkedinUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a LinkedIn profile URL',
      });
      return;
    }

    setLoading(prev => ({ ...prev, linkedin: true }));
    try {
      await portfolioApi.updateFromLinkedIn(linkedinUrl);
      toast({
        title: 'LinkedIn Connected',
        description: 'Your LinkedIn profile has been linked successfully.',
      });
      fetchPortfolio();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'LinkedIn Error',
        description: 'Failed to connect LinkedIn profile. Please check the URL and try again.',
      });
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  const handleResumeUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a resume PDF file',
      });
      return;
    }

    setLoading(prev => ({ ...prev, resume: true }));
    try {
      await portfolioApi.uploadResume(selectedFile);
      toast({
        title: 'Resume Processed',
        description: 'Your resume has been uploaded and analyzed successfully.',
      });
      fetchPortfolio();
      setSelectedFile(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: 'Failed to process resume.',
      });
    } finally {
      setLoading(prev => ({ ...prev, resume: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePreview = () => {
    navigate('/');
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Portfolio Dashboard</h1>
        <Button onClick={handlePreview}>View Portfolio</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Import your professional data from multiple sources</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="github">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="github">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </TabsTrigger>
                <TabsTrigger value="linkedin">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </TabsTrigger>
                <TabsTrigger value="resume">
                  <FileText className="mr-2 h-4 w-4" />
                  Resume
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="github">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-username">GitHub Username</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="github-username" 
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        placeholder="Enter your GitHub username"
                      />
                      <Button onClick={handleGithubImport} disabled={loading.github}>
                        {loading.github ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
                        Import
                      </Button>
                    </div>
                  </div>
                  
                  {portfolio?.lastUpdated?.github && (
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(portfolio.lastUpdated.github).toLocaleString()}
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="linkedin">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="linkedin-url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                      <Button onClick={handleLinkedInUpdate} disabled={loading.linkedin}>
                        {loading.linkedin ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Linkedin className="mr-2 h-4 w-4" />}
                        Connect
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your public LinkedIn profile URL to link it to your portfolio.
                    </p>
                  </div>
                  
                  {portfolio?.socialLinks?.linkedin && (
                    <div className="rounded-md bg-muted p-4 mt-4">
                      <p className="text-sm font-medium">Linked Profile:</p>
                      <a 
                        href={portfolio.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                      >
                        <Linkedin className="h-3 w-3" />
                        {portfolio.socialLinks.linkedin}
                      </a>
                      <p className="text-sm text-muted-foreground mt-2">
                        Last updated: {portfolio?.lastUpdated?.linkedin ? 
                          new Date(portfolio.lastUpdated.linkedin).toLocaleString() : 
                          'Never'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="resume">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Upload Resume (PDF)</Label>
                    <Input 
                      id="resume" 
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                  <Button onClick={handleResumeUpload} disabled={loading.resume || !selectedFile}>
                    {loading.resume ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Process Resume
                  </Button>
                  
                  {portfolio?.lastUpdated?.resume && (
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(portfolio.lastUpdated.resume).toLocaleString()}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Professional insights based on your portfolio data</CardDescription>
          </CardHeader>
          <CardContent>
            {!portfolio?.projects?.length && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No data available</AlertTitle>
                <AlertDescription>
                  Import data from GitHub, LinkedIn, or resume first to view insights.
                </AlertDescription>
              </Alert>
            )}

            {portfolio?.projects?.length > 0 && !portfolio?.insights && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No insights available</AlertTitle>
                <AlertDescription>
                  Your portfolio has data, but insights haven't been generated yet.
                </AlertDescription>
              </Alert>
            )}

            {portfolio?.insights && (
              <div className="space-y-6">
                {portfolio.insights.topSkills && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Top Skills</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {portfolio.insights.topSkills.slice(0, 6).map((skill, i) => (
                        <div key={i} className="bg-secondary/20 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{skill.name}</span>
                            <Badge>{skill.category}</Badge>
                          </div>
                          <div className="w-full bg-secondary/30 h-2 rounded-full">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${skill.proficiency}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{skill.justification}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {portfolio.insights.technicalProfile?.primaryStack && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Primary Tech Stack</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {portfolio.insights.technicalProfile.primaryStack.map((tech, i) => (
                        <Badge key={i} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {portfolio.insights.careerTrajectory && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Career Trajectory</h3>
                    <p className="text-sm text-muted-foreground">{portfolio.insights.careerTrajectory}</p>
                  </div>
                )}

                {portfolio.insights.summary?.strengthsAnalysis && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Strengths Analysis</h3>
                    <p className="text-sm text-muted-foreground">{portfolio.insights.summary.strengthsAnalysis}</p>
                  </div>
                )}

                {portfolio.insights.summary?.learningRecommendations && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Learning Recommendations</h3>
                    <p className="text-sm text-muted-foreground">{portfolio.insights.summary.learningRecommendations}</p>
                  </div>
                )}

                {portfolio.insights.careerRecommendations?.potentialRoles && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Potential Roles</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {portfolio.insights.careerRecommendations.potentialRoles.slice(0, 8).map((role, i) => (
                        <Badge key={i} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}