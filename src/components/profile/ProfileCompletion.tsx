import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { ProfileFormData } from '@/lib/validations/profile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProfileCompletionProps {
  profile: Partial<ProfileFormData>;
}

export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const requiredFields = [
    { name: 'full_name', label: 'Full Name' },
    { name: 'email', label: 'Email' },
    { name: 'phone', label: 'Phone' },
    { name: 'address', label: 'Address' },
  ];

  const optionalFields = [
    { name: 'bio', label: 'Bio' },
    { name: 'company', label: 'Company' },
    { name: 'website', label: 'Website' },
    { name: 'preferences', label: 'Preferences' },
  ];

  const calculateCompletion = () => {
    let completed = 0;
    let total = requiredFields.length + optionalFields.length;

    // Check required fields
    requiredFields.forEach(field => {
      if (profile[field.name as keyof typeof profile]) completed++;
    });

    // Check optional fields
    optionalFields.forEach(field => {
      if (profile[field.name as keyof typeof profile]) completed++;
    });

    // Check address fields if address exists
    if (profile.address) {
      const addressFields = ['street', 'city', 'state', 'postal_code', 'country'];
      addressFields.forEach(field => {
        if (profile.address?.[field as keyof typeof profile.address]) completed++;
      });
      total += addressFields.length - 1; // -1 because we already counted address itself
    }

    return Math.round((completed / total) * 100);
  };

  const completion = calculateCompletion();
  const getCompletionColor = (percentage: number) => {
    if (percentage < 40) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMissingFields = () => {
    const missing = [];
    
    for (const field of requiredFields) {
      if (!profile[field.name as keyof typeof profile]) {
        missing.push(field.label);
      }
    }

    if (profile.address) {
      const addressFields = [
        { key: 'street', label: 'Street Address' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'postal_code', label: 'Postal Code' },
        { key: 'country', label: 'Country' }
      ];

      for (const field of addressFields) {
        if (!profile.address[field.key as keyof typeof profile.address]) {
          missing.push(field.label);
        }
      }
    } else {
      missing.push('Address');
    }

    return missing;
  };

  const missingFields = getMissingFields();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">Profile Completion</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Complete your profile to unlock all features</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge variant={completion === 100 ? "success" : "secondary"}>
          {completion}%
        </Badge>
      </div>

      <Progress
        value={completion}
        className={getCompletionColor(completion)}
      />

      {missingFields.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>Missing information:</p>
          <ul className="list-disc list-inside mt-1">
            {missingFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
