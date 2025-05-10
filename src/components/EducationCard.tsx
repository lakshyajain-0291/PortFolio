import { FC } from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SECTION_NUMBERS } from '@/config/env';

interface EducationCardProps {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  location: string;
  description?: string;
  grade?: string;
  url?: string;
}

const EducationCard: FC<EducationCardProps> = ({
  school,
  degree,
  fieldOfStudy,
  startDate,
  endDate,
  location,
  description,
  grade,
  url
}) => {
  return (
    <Card className={`bg-darktech-card border-darktech-border hover:border-darktech-neon-green/50 transition-all duration-300 group overflow-hidden max-w-[90%] ${
      SECTION_NUMBERS.EDUCATION === 0 
      ? 'mx-auto' 
      : SECTION_NUMBERS.EDUCATION % 2 === 0 
        ? 'ml-auto' 
        : 'mr-auto'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-darktech-holo-cyan group-hover:text-darktech-neon-green transition-colors duration-300">
              {degree} {fieldOfStudy && `in ${fieldOfStudy}`}
            </CardTitle>
            <CardDescription className="text-lg font-medium text-darktech-text mt-1 flex items-center">
              {school}
              {url && (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex ml-2 text-darktech-neon-blue/70 hover:text-darktech-neon-blue transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </CardDescription>
          </div>
          {grade && (
            <div className="bg-darktech-accent/20 text-darktech-neon-green px-2 py-1 rounded text-sm font-medium">
              {grade}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-darktech-text/80 text-sm">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1.5" />
            <span>{startDate} - {endDate || 'Present'}</span>
          </div>
          <div className="flex items-center">
            <MapPin size={14} className="mr-1.5" />
            <span>{location}</span>
          </div>
        </div>
      </CardHeader>
      
      {description && (
        <CardContent className="pt-2">
          <p className="text-darktech-text/90">{description}</p>
        </CardContent>
      )}
    </Card>
  );
};

export default EducationCard;