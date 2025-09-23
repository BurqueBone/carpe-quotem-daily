import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Heart, Users, Dumbbell } from "lucide-react";

interface LifeArea {
  id: string;
  name: string;
  icon: React.ReactNode;
  rating: number;
  color: string;
}

interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  blocks: Array<{
    areaId: string;
    day: string;
    hour: number;
  }>;
  explanation: string;
  highlights: string[];
}

interface IdealWeekProfilesProps {
  lifeAreas: LifeArea[];
  onProfileSelected: (blocks: Array<{ areaId: string; day: string; hour: number }>) => void;
}

const IdealWeekProfiles: React.FC<IdealWeekProfilesProps> = ({
  lifeAreas,
  onProfileSelected
}) => {
  const profileTemplates: ProfileTemplate[] = [
    {
      id: 'career-driven',
      name: 'Career Driven',
      description: 'For ambitious professionals focused on career growth and achievement.',
      icon: <Briefcase className="w-5 h-5" />,
      explanation: 'This profile prioritizes professional development while maintaining essential health and relationships. Heavy focus on work hours with strategic networking and skill-building sessions.',
      highlights: ['50+ hours work/career', 'Strategic networking', 'Skill development', 'Maintained relationships'],
      blocks: [
        // Weekday work blocks (9-5 core + extended hours)
        { areaId: 'career', day: 'Monday', hour: 8 },
        { areaId: 'career', day: 'Monday', hour: 9 },
        { areaId: 'career', day: 'Monday', hour: 10 },
        { areaId: 'career', day: 'Monday', hour: 11 },
        { areaId: 'career', day: 'Monday', hour: 13 },
        { areaId: 'career', day: 'Monday', hour: 14 },
        { areaId: 'career', day: 'Monday', hour: 15 },
        { areaId: 'career', day: 'Monday', hour: 16 },
        { areaId: 'career', day: 'Monday', hour: 17 },
        
        { areaId: 'career', day: 'Tuesday', hour: 8 },
        { areaId: 'career', day: 'Tuesday', hour: 9 },
        { areaId: 'career', day: 'Tuesday', hour: 10 },
        { areaId: 'career', day: 'Tuesday', hour: 11 },
        { areaId: 'career', day: 'Tuesday', hour: 13 },
        { areaId: 'career', day: 'Tuesday', hour: 14 },
        { areaId: 'career', day: 'Tuesday', hour: 15 },
        { areaId: 'career', day: 'Tuesday', hour: 16 },
        { areaId: 'career', day: 'Tuesday', hour: 17 },
        
        { areaId: 'career', day: 'Wednesday', hour: 8 },
        { areaId: 'career', day: 'Wednesday', hour: 9 },
        { areaId: 'career', day: 'Wednesday', hour: 10 },
        { areaId: 'career', day: 'Wednesday', hour: 11 },
        { areaId: 'career', day: 'Wednesday', hour: 13 },
        { areaId: 'career', day: 'Wednesday', hour: 14 },
        { areaId: 'career', day: 'Wednesday', hour: 15 },
        { areaId: 'career', day: 'Wednesday', hour: 16 },
        { areaId: 'career', day: 'Wednesday', hour: 17 },
        
        { areaId: 'career', day: 'Thursday', hour: 8 },
        { areaId: 'career', day: 'Thursday', hour: 9 },
        { areaId: 'career', day: 'Thursday', hour: 10 },
        { areaId: 'career', day: 'Thursday', hour: 11 },
        { areaId: 'career', day: 'Thursday', hour: 13 },
        { areaId: 'career', day: 'Thursday', hour: 14 },
        { areaId: 'career', day: 'Thursday', hour: 15 },
        { areaId: 'career', day: 'Thursday', hour: 16 },
        { areaId: 'career', day: 'Thursday', hour: 17 },
        
        { areaId: 'career', day: 'Friday', hour: 8 },
        { areaId: 'career', day: 'Friday', hour: 9 },
        { areaId: 'career', day: 'Friday', hour: 10 },
        { areaId: 'career', day: 'Friday', hour: 11 },
        { areaId: 'career', day: 'Friday', hour: 13 },
        { areaId: 'career', day: 'Friday', hour: 14 },
        { areaId: 'career', day: 'Friday', hour: 15 },
        { areaId: 'career', day: 'Friday', hour: 16 },
        
        // Health blocks
        { areaId: 'health', day: 'Monday', hour: 6 },
        { areaId: 'health', day: 'Wednesday', hour: 6 },
        { areaId: 'health', day: 'Friday', hour: 6 },
        { areaId: 'health', day: 'Saturday', hour: 9 },
        
        // Relationships
        { areaId: 'relationships', day: 'Tuesday', hour: 19 },
        { areaId: 'relationships', day: 'Friday', hour: 19 },
        { areaId: 'relationships', day: 'Saturday', hour: 18 },
        { areaId: 'relationships', day: 'Sunday', hour: 12 },
        
        // Personal Growth
        { areaId: 'growth', day: 'Sunday', hour: 8 },
        { areaId: 'growth', day: 'Sunday', hour: 9 },
        
        // Social networking
        { areaId: 'social', day: 'Thursday', hour: 18 },
        { areaId: 'social', day: 'Saturday', hour: 20 },
      ]
    },
    {
      id: 'family-focused',
      name: 'Family Focused',
      description: 'Perfect for those who prioritize family time and meaningful relationships.',
      icon: <Heart className="w-5 h-5" />,
      explanation: 'This profile centers around family activities and relationship building while maintaining career stability. Designed for parents or those with strong family commitments.',
      highlights: ['Family-first scheduling', 'Work-life balance', 'Quality time blocks', 'Community involvement'],
      blocks: [
        // Work blocks (standard 9-5)
        { areaId: 'career', day: 'Monday', hour: 9 },
        { areaId: 'career', day: 'Monday', hour: 10 },
        { areaId: 'career', day: 'Monday', hour: 11 },
        { areaId: 'career', day: 'Monday', hour: 13 },
        { areaId: 'career', day: 'Monday', hour: 14 },
        { areaId: 'career', day: 'Monday', hour: 15 },
        { areaId: 'career', day: 'Monday', hour: 16 },
        
        { areaId: 'career', day: 'Tuesday', hour: 9 },
        { areaId: 'career', day: 'Tuesday', hour: 10 },
        { areaId: 'career', day: 'Tuesday', hour: 11 },
        { areaId: 'career', day: 'Tuesday', hour: 13 },
        { areaId: 'career', day: 'Tuesday', hour: 14 },
        { areaId: 'career', day: 'Tuesday', hour: 15 },
        { areaId: 'career', day: 'Tuesday', hour: 16 },
        
        { areaId: 'career', day: 'Wednesday', hour: 9 },
        { areaId: 'career', day: 'Wednesday', hour: 10 },
        { areaId: 'career', day: 'Wednesday', hour: 11 },
        { areaId: 'career', day: 'Wednesday', hour: 13 },
        { areaId: 'career', day: 'Wednesday', hour: 14 },
        { areaId: 'career', day: 'Wednesday', hour: 15 },
        { areaId: 'career', day: 'Wednesday', hour: 16 },
        
        { areaId: 'career', day: 'Thursday', hour: 9 },
        { areaId: 'career', day: 'Thursday', hour: 10 },
        { areaId: 'career', day: 'Thursday', hour: 11 },
        { areaId: 'career', day: 'Thursday', hour: 13 },
        { areaId: 'career', day: 'Thursday', hour: 14 },
        { areaId: 'career', day: 'Thursday', hour: 15 },
        { areaId: 'career', day: 'Thursday', hour: 16 },
        
        { areaId: 'career', day: 'Friday', hour: 9 },
        { areaId: 'career', day: 'Friday', hour: 10 },
        { areaId: 'career', day: 'Friday', hour: 11 },
        { areaId: 'career', day: 'Friday', hour: 13 },
        { areaId: 'career', day: 'Friday', hour: 14 },
        { areaId: 'career', day: 'Friday', hour: 15 },
        
        // Heavy family/relationship time
        { areaId: 'relationships', day: 'Monday', hour: 17 },
        { areaId: 'relationships', day: 'Monday', hour: 18 },
        { areaId: 'relationships', day: 'Monday', hour: 19 },
        { areaId: 'relationships', day: 'Tuesday', hour: 17 },
        { areaId: 'relationships', day: 'Tuesday', hour: 18 },
        { areaId: 'relationships', day: 'Tuesday', hour: 19 },
        { areaId: 'relationships', day: 'Wednesday', hour: 17 },
        { areaId: 'relationships', day: 'Wednesday', hour: 18 },
        { areaId: 'relationships', day: 'Wednesday', hour: 19 },
        { areaId: 'relationships', day: 'Thursday', hour: 17 },
        { areaId: 'relationships', day: 'Thursday', hour: 18 },
        { areaId: 'relationships', day: 'Thursday', hour: 19 },
        { areaId: 'relationships', day: 'Friday', hour: 17 },
        { areaId: 'relationships', day: 'Friday', hour: 18 },
        { areaId: 'relationships', day: 'Friday', hour: 19 },
        
        // Weekend family time
        { areaId: 'relationships', day: 'Saturday', hour: 10 },
        { areaId: 'relationships', day: 'Saturday', hour: 11 },
        { areaId: 'relationships', day: 'Saturday', hour: 12 },
        { areaId: 'relationships', day: 'Saturday', hour: 13 },
        { areaId: 'relationships', day: 'Saturday', hour: 14 },
        { areaId: 'relationships', day: 'Saturday', hour: 15 },
        { areaId: 'relationships', day: 'Sunday', hour: 10 },
        { areaId: 'relationships', day: 'Sunday', hour: 11 },
        { areaId: 'relationships', day: 'Sunday', hour: 12 },
        { areaId: 'relationships', day: 'Sunday', hour: 13 },
        { areaId: 'relationships', day: 'Sunday', hour: 14 },
        
        // Health
        { areaId: 'health', day: 'Monday', hour: 6 },
        { areaId: 'health', day: 'Wednesday', hour: 6 },
        { areaId: 'health', day: 'Friday', hour: 6 },
        { areaId: 'health', day: 'Sunday', hour: 8 },
        
        // Contribution/Community
        { areaId: 'contribution', day: 'Saturday', hour: 16 },
        { areaId: 'contribution', day: 'Saturday', hour: 17 },
        { areaId: 'contribution', day: 'Sunday', hour: 15 },
        
        // Family hobbies
        { areaId: 'hobbies', day: 'Saturday', hour: 18 },
        { areaId: 'hobbies', day: 'Sunday', hour: 16 },
      ]
    },
    {
      id: 'fitness-leader',
      name: 'Fitness Leader',
      description: 'For health enthusiasts who make wellness a central part of their lifestyle.',
      icon: <Dumbbell className="w-5 h-5" />,
      explanation: 'This profile maximizes health and wellness activities including multiple workout sessions, meal prep, and recovery time. Ideal for fitness enthusiasts and health coaches.',
      highlights: ['Daily fitness routine', 'Meal prep time', 'Recovery blocks', 'Wellness education'],
      blocks: [
        // Daily morning workouts
        { areaId: 'health', day: 'Monday', hour: 6 },
        { areaId: 'health', day: 'Monday', hour: 7 },
        { areaId: 'health', day: 'Tuesday', hour: 6 },
        { areaId: 'health', day: 'Tuesday', hour: 7 },
        { areaId: 'health', day: 'Wednesday', hour: 6 },
        { areaId: 'health', day: 'Wednesday', hour: 7 },
        { areaId: 'health', day: 'Thursday', hour: 6 },
        { areaId: 'health', day: 'Thursday', hour: 7 },
        { areaId: 'health', day: 'Friday', hour: 6 },
        { areaId: 'health', day: 'Friday', hour: 7 },
        { areaId: 'health', day: 'Saturday', hour: 8 },
        { areaId: 'health', day: 'Saturday', hour: 9 },
        { areaId: 'health', day: 'Saturday', hour: 10 },
        { areaId: 'health', day: 'Sunday', hour: 8 },
        { areaId: 'health', day: 'Sunday', hour: 9 },
        
        // Meal prep and nutrition
        { areaId: 'health', day: 'Sunday', hour: 11 },
        { areaId: 'health', day: 'Sunday', hour: 12 },
        { areaId: 'health', day: 'Wednesday', hour: 19 },
        
        // Work blocks (balanced)
        { areaId: 'career', day: 'Monday', hour: 9 },
        { areaId: 'career', day: 'Monday', hour: 10 },
        { areaId: 'career', day: 'Monday', hour: 11 },
        { areaId: 'career', day: 'Monday', hour: 13 },
        { areaId: 'career', day: 'Monday', hour: 14 },
        { areaId: 'career', day: 'Monday', hour: 15 },
        { areaId: 'career', day: 'Monday', hour: 16 },
        
        { areaId: 'career', day: 'Tuesday', hour: 9 },
        { areaId: 'career', day: 'Tuesday', hour: 10 },
        { areaId: 'career', day: 'Tuesday', hour: 11 },
        { areaId: 'career', day: 'Tuesday', hour: 13 },
        { areaId: 'career', day: 'Tuesday', hour: 14 },
        { areaId: 'career', day: 'Tuesday', hour: 15 },
        { areaId: 'career', day: 'Tuesday', hour: 16 },
        
        { areaId: 'career', day: 'Wednesday', hour: 9 },
        { areaId: 'career', day: 'Wednesday', hour: 10 },
        { areaId: 'career', day: 'Wednesday', hour: 11 },
        { areaId: 'career', day: 'Wednesday', hour: 13 },
        { areaId: 'career', day: 'Wednesday', hour: 14 },
        { areaId: 'career', day: 'Wednesday', hour: 15 },
        { areaId: 'career', day: 'Wednesday', hour: 16 },
        
        { areaId: 'career', day: 'Thursday', hour: 9 },
        { areaId: 'career', day: 'Thursday', hour: 10 },
        { areaId: 'career', day: 'Thursday', hour: 11 },
        { areaId: 'career', day: 'Thursday', hour: 13 },
        { areaId: 'career', day: 'Thursday', hour: 14 },
        { areaId: 'career', day: 'Thursday', hour: 15 },
        { areaId: 'career', day: 'Thursday', hour: 16 },
        
        { areaId: 'career', day: 'Friday', hour: 9 },
        { areaId: 'career', day: 'Friday', hour: 10 },
        { areaId: 'career', day: 'Friday', hour: 11 },
        { areaId: 'career', day: 'Friday', hour: 13 },
        { areaId: 'career', day: 'Friday', hour: 14 },
        { areaId: 'career', day: 'Friday', hour: 15 },
        
        // Personal growth (health education)
        { areaId: 'growth', day: 'Tuesday', hour: 20 },
        { areaId: 'growth', day: 'Thursday', hour: 20 },
        { areaId: 'growth', day: 'Sunday', hour: 14 },
        
        // Social fitness activities
        { areaId: 'social', day: 'Saturday', hour: 11 },
        { areaId: 'social', day: 'Saturday', hour: 19 },
        { areaId: 'social', day: 'Friday', hour: 18 },
        
        // Relationships
        { areaId: 'relationships', day: 'Monday', hour: 18 },
        { areaId: 'relationships', day: 'Tuesday', hour: 18 },
        { areaId: 'relationships', day: 'Wednesday', hour: 18 },
        { areaId: 'relationships', day: 'Thursday', hour: 18 },
        { areaId: 'relationships', day: 'Friday', hour: 19 },
        { areaId: 'relationships', day: 'Saturday', hour: 17 },
        { areaId: 'relationships', day: 'Sunday', hour: 15 },
        
        // Active hobbies
        { areaId: 'hobbies', day: 'Saturday', hour: 14 },
        { areaId: 'hobbies', day: 'Saturday', hour: 15 },
        { areaId: 'hobbies', day: 'Sunday', hour: 16 },
      ]
    },
    {
      id: 'life-of-party',
      name: 'Life of the Party',
      description: 'For social butterflies who thrive on connection and shared experiences.',
      icon: <Users className="w-5 h-5" />,
      explanation: 'This profile maximizes social connections and fun activities while maintaining essential responsibilities. Perfect for extroverts who get energy from social interactions.',
      highlights: ['High social activity', 'Event planning', 'Community engagement', 'Balanced fun'],
      blocks: [
        // Work (efficient but balanced)
        { areaId: 'career', day: 'Monday', hour: 9 },
        { areaId: 'career', day: 'Monday', hour: 10 },
        { areaId: 'career', day: 'Monday', hour: 11 },
        { areaId: 'career', day: 'Monday', hour: 13 },
        { areaId: 'career', day: 'Monday', hour: 14 },
        { areaId: 'career', day: 'Monday', hour: 15 },
        
        { areaId: 'career', day: 'Tuesday', hour: 9 },
        { areaId: 'career', day: 'Tuesday', hour: 10 },
        { areaId: 'career', day: 'Tuesday', hour: 11 },
        { areaId: 'career', day: 'Tuesday', hour: 13 },
        { areaId: 'career', day: 'Tuesday', hour: 14 },
        { areaId: 'career', day: 'Tuesday', hour: 15 },
        
        { areaId: 'career', day: 'Wednesday', hour: 9 },
        { areaId: 'career', day: 'Wednesday', hour: 10 },
        { areaId: 'career', day: 'Wednesday', hour: 11 },
        { areaId: 'career', day: 'Wednesday', hour: 13 },
        { areaId: 'career', day: 'Wednesday', hour: 14 },
        { areaId: 'career', day: 'Wednesday', hour: 15 },
        
        { areaId: 'career', day: 'Thursday', hour: 9 },
        { areaId: 'career', day: 'Thursday', hour: 10 },
        { areaId: 'career', day: 'Thursday', hour: 11 },
        { areaId: 'career', day: 'Thursday', hour: 13 },
        { areaId: 'career', day: 'Thursday', hour: 14 },
        { areaId: 'career', day: 'Thursday', hour: 15 },
        
        { areaId: 'career', day: 'Friday', hour: 9 },
        { areaId: 'career', day: 'Friday', hour: 10 },
        { areaId: 'career', day: 'Friday', hour: 11 },
        { areaId: 'career', day: 'Friday', hour: 13 },
        
        // High social activity
        { areaId: 'social', day: 'Monday', hour: 18 },
        { areaId: 'social', day: 'Monday', hour: 19 },
        { areaId: 'social', day: 'Tuesday', hour: 17 },
        { areaId: 'social', day: 'Tuesday', hour: 18 },
        { areaId: 'social', day: 'Tuesday', hour: 19 },
        { areaId: 'social', day: 'Wednesday', hour: 17 },
        { areaId: 'social', day: 'Wednesday', hour: 18 },
        { areaId: 'social', day: 'Wednesday', hour: 19 },
        { areaId: 'social', day: 'Thursday', hour: 17 },
        { areaId: 'social', day: 'Thursday', hour: 18 },
        { areaId: 'social', day: 'Thursday', hour: 19 },
        { areaId: 'social', day: 'Thursday', hour: 20 },
        { areaId: 'social', day: 'Friday', hour: 16 },
        { areaId: 'social', day: 'Friday', hour: 17 },
        { areaId: 'social', day: 'Friday', hour: 18 },
        { areaId: 'social', day: 'Friday', hour: 19 },
        { areaId: 'social', day: 'Friday', hour: 20 },
        
        // Weekend social events
        { areaId: 'social', day: 'Saturday', hour: 12 },
        { areaId: 'social', day: 'Saturday', hour: 13 },
        { areaId: 'social', day: 'Saturday', hour: 14 },
        { areaId: 'social', day: 'Saturday', hour: 18 },
        { areaId: 'social', day: 'Saturday', hour: 19 },
        { areaId: 'social', day: 'Saturday', hour: 20 },
        { areaId: 'social', day: 'Sunday', hour: 13 },
        { areaId: 'social', day: 'Sunday', hour: 14 },
        { areaId: 'social', day: 'Sunday', hour: 15 },
        
        // Hobbies and fun
        { areaId: 'hobbies', day: 'Monday', hour: 16 },
        { areaId: 'hobbies', day: 'Tuesday', hour: 16 },
        { areaId: 'hobbies', day: 'Wednesday', hour: 16 },
        { areaId: 'hobbies', day: 'Thursday', hour: 16 },
        { areaId: 'hobbies', day: 'Friday', hour: 14 },
        { areaId: 'hobbies', day: 'Saturday', hour: 10 },
        { areaId: 'hobbies', day: 'Saturday', hour: 11 },
        { areaId: 'hobbies', day: 'Sunday', hour: 11 },
        { areaId: 'hobbies', day: 'Sunday', hour: 12 },
        
        // Relationships (close friends/family)
        { areaId: 'relationships', day: 'Saturday', hour: 15 },
        { areaId: 'relationships', day: 'Saturday', hour: 16 },
        { areaId: 'relationships', day: 'Sunday', hour: 16 },
        { areaId: 'relationships', day: 'Sunday', hour: 17 },
        
        // Health (social fitness)
        { areaId: 'health', day: 'Monday', hour: 7 },
        { areaId: 'health', day: 'Wednesday', hour: 7 },
        { areaId: 'health', day: 'Friday', hour: 7 },
        { areaId: 'health', day: 'Saturday', hour: 9 },
        
        // Personal growth
        { areaId: 'growth', day: 'Sunday', hour: 9 },
        { areaId: 'growth', day: 'Sunday', hour: 10 },
      ]
    }
  ];

  const handleProfileSelect = (profile: ProfileTemplate) => {
    onProfileSelected(profile.blocks);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Quick Start Templates</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose a pre-designed ideal week that matches your lifestyle, or start from scratch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileTemplates.map(profile => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="text-primary">
                  {profile.icon}
                </div>
                {profile.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {profile.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {profile.explanation}
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.highlights.map(highlight => (
                    <Badge key={highlight} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => handleProfileSelect(profile)}
                className="w-full"
                variant="outline"
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IdealWeekProfiles;