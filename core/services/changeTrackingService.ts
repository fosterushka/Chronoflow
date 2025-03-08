import { Card, AuditEntry } from "../types/shared.ts";
import { createAuditEntry } from "../utils/auditUtils.ts";

type TrackableField = keyof Card | string;

interface FieldConfig {
  displayName: string;
  compareFunction?: (oldValue: any, newValue: any) => boolean;
  formatValue?: (value: any) => string;
}

const fieldConfigurations: Record<TrackableField, FieldConfig> = {
  title: {
    displayName: "Title",
    formatValue: (value) => value?.toString() || "",
  },
  description: {
    displayName: "Description",
    formatValue: (value) => value?.toString() || "",
  },
  labels: {
    displayName: "Labels",
    compareFunction: (old, next) => 
      JSON.stringify(old || []) === JSON.stringify(next || []),
    formatValue: (value) => JSON.stringify(value || []),
  },
  checklist: {
    displayName: "Checklist",
    compareFunction: (old, next) => 
      JSON.stringify(old || []) === JSON.stringify(next || []),
    formatValue: (value) => JSON.stringify(value || []),
  },
  meetings: {
    displayName: "Meetings",
    compareFunction: (old, next) => 
      JSON.stringify(old || []) === JSON.stringify(next || []),
    formatValue: (value) => JSON.stringify(value || []),
  },
  dueDate: {
    displayName: "Due Date",
    formatValue: (value) => value || "Not set",
  },
  estimatedTime: {
    displayName: "Estimated Time",
    formatValue: (value) => value ? `${value} minutes` : "Not set",
  },
  github: {
    displayName: "GitHub Settings",
    compareFunction: (old, next) => 
      JSON.stringify(old || {}) === JSON.stringify(next || {}),
    formatValue: (value) => JSON.stringify(value || {}),
  },
  relatedItems: {
    displayName: "Related Items",
    compareFunction: (old, next) => 
      JSON.stringify(old || []) === JSON.stringify(next || []),
    formatValue: (value) => JSON.stringify(value || []),
  },
};

export class ChangeTrackingService {
  private static hasFieldChanged(
    oldValue: any,
    newValue: any,
    field: TrackableField,
  ): boolean {
    const config = fieldConfigurations[field];
    
    if (config?.compareFunction) {
      return !config.compareFunction(oldValue, newValue);
    }
    
    return oldValue !== newValue;
  }

  private static formatValue(value: any, field: TrackableField): string {
    const config = fieldConfigurations[field];
    if (config?.formatValue) {
      return config.formatValue(value);
    }
    return String(value);
  }

  static trackChanges(oldCard: Card, newCard: Card): AuditEntry[] {
    const auditEntries: AuditEntry[] = [];

    // Track changes for all configured fields
    Object.keys(fieldConfigurations).forEach((field) => {
      const typedField = field as TrackableField;
      const oldValue = oldCard[typedField as keyof Card];
      const newValue = newCard[typedField as keyof Card];

      if (this.hasFieldChanged(oldValue, newValue, typedField)) {
        const config = fieldConfigurations[typedField];
        
        auditEntries.push(
          createAuditEntry("update", {
            field: config.displayName,
            oldValue: this.formatValue(oldValue, typedField),
            newValue: this.formatValue(newValue, typedField),
          })
        );
      }
    });

    return auditEntries;
  }

  static addCustomTrackableField(
    field: string,
    config: FieldConfig
  ): void {
    fieldConfigurations[field] = config;
  }
}

// Helper function to apply tracked changes
export const applyTrackedChanges = (
  oldCard: Card,
  newCard: Card
): Card => {
  const auditEntries = ChangeTrackingService.trackChanges(oldCard, newCard);
  
  return {
    ...newCard,
    auditHistory: [
      ...(oldCard.auditHistory || []),
      ...auditEntries,
    ],
  };
};