"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { FieldType } from "@/lib/type";

const fieldTypes: { label: string; value: FieldType }[] = [
  { label: "Prénom", value: "first_name" },
  { label: "Nom", value: "last_name" },
  { label: "Email", value: "email" },
  { label: "Mot de passe", value: "password" },
];

interface FieldRowProps {
  index: number;
  name: string;
  type: FieldType;
  onChange: (index: number, key: "name" | "type", value: string) => void;
  onRemove: (index: number) => void;
}

export default function FieldRow({
  index,
  name,
  type,
  onChange,
  onRemove,
}: FieldRowProps) {
  return (
    <div className="flex items-center gap-3 mb-3 animate-in fade-in slide-in-from-bottom-2">
      <Input
        type="text"
        value={name}
        placeholder="Nom de la colonne"
        onChange={(e) => onChange(index, "name", e.target.value)}
        className="w-1/2"
      />
      <Select
        value={type}
        onValueChange={(val) => onChange(index, "type", val)}
      >
        <SelectTrigger className="w-1/2">
          <SelectValue placeholder="Type de champ" />
        </SelectTrigger>
        <SelectContent>
          {fieldTypes.map((ft) => (
            <SelectItem key={ft.value} value={ft.value}>
              {ft.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onRemove(index)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
