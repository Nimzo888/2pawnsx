import * as React from "react";
import { cn } from "@/lib/utils";

interface Tabs2Props {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function Tabs2({ defaultValue, className, children }: Tabs2Props) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  // Filter children to get only TabsTrigger and TabsContent
  const triggers: React.ReactElement[] = [];
  const contents: React.ReactElement[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === TabsTrigger) {
        triggers.push(child);
      } else if (child.type === TabsContent) {
        contents.push(child);
      }
    }
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        {triggers.map((trigger) => {
          const isActive = trigger.props.value === activeTab;
          return React.cloneElement(trigger, {
            ...trigger.props,
            isActive,
            onClick: () => setActiveTab(trigger.props.value),
          });
        })}
      </div>
      {contents.map((content) => {
        const isActive = content.props.value === activeTab;
        return isActive ? content : null;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export function TabsTrigger({
  value,
  children,
  isActive,
  onClick,
}: TabsTriggerProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function TabsContent({ value, children }: TabsContentProps) {
  return <div className="mt-2">{children}</div>;
}
