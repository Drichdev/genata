"use client";

import React, { useState } from "react";
import { FieldType, supportedTypes } from "@/lib/type";
import { generateMockData } from "@/lib/utils/dataGenerator";
import { exportToCSV } from "@/lib/utils/exporters/toCSV";
import { exportToJSON } from "@/lib/utils/exporters/toJSON";
import { exportToSQL } from "@/lib/utils/exporters/toSQL";
import { exportToPostgres } from "@/lib/utils/exporters/toPostgres";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ChevronsUpDown,
  Check,
  Plus,
  Trash2,
  RefreshCcw,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExportType = "csv" | "json" | "sql" | "postgres";

interface Field {
  name: string;
  type: FieldType;
}

const fieldOptions: { label: string; value: FieldType }[] =
  (supportedTypes as unknown as { label: string; value: FieldType }[]);

export default function HomePage() {
  const [fields, setFields] = useState<Field[]>([
    { name: "id", type: "id_increment" },
    { name: "nom", type: "last_name" },
    { name: "prenom", type: "first_name" },
  ]);
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loadingCols, setLoadingCols] = useState<number[]>([]); // cols en chargement
  const [count, setCount] = useState(50);
  const [exportType, setExportType] = useState<ExportType>("csv");

  // Génère un nom unique de colonne
  const getUniqueName = (base: string = "col"): string => {
    const existing = new Set(fields.map((f) => f.name).filter(Boolean));
    let i = 1;
    while (existing.has(`${base}_${i}`)) i++;
    return `${base}_${i}`;
  };

  // 🔹 Initial data generation on first load or manual
  const handleGenerate = async () => {
    const safeCount = Math.min(Math.max(count, 1), 1000);
    setLoadingCols(fields.map((_, i) => i)); // all columns loading
    await new Promise((r) => setTimeout(r, 1000));

    const generated = generateMockData(fields, safeCount);
    setData(generated);
    setLoadingCols([]);
  };

  const handleNameChange = (index: number, value: string) => {
    const prevName = fields[index].name;
    const newFields = [...fields];
    newFields[index].name = value;
    setFields(newFields);

    // Migrer les données existantes vers la nouvelle clé
    if (prevName && value && prevName !== value && data.length > 0) {
      setData((prev) =>
        prev.map((row) => {
          if (row && Object.prototype.hasOwnProperty.call(row, prevName)) {
            const updated = { ...row };
            updated[value] = updated[prevName];
            delete updated[prevName];
            return updated;
          }
          return row;
        })
      );
    }
  };

  // 🔹 Quand on sélectionne un type, on génère uniquement cette colonne
  const handleTypeChange = async (index: number, type: FieldType) => {
    const newFields = [...fields];
    newFields[index].type = type;
    // Si le nom est vide, lui attribuer un nom unique pour éviter les collisions de clé
    if (!newFields[index].name || newFields[index].name.trim() === "") {
      newFields[index].name = getUniqueName(
        type.replace(/[^a-zA-Z]/g, "") || "col"
      );
    }
    setFields(newFields);

    // afficher le skeleton seulement pour cette colonne
    setLoadingCols((prev) => [...prev, index]);
    await new Promise((r) => setTimeout(r, 1000));

    const newData = [...data];
    const safeCount = Math.min(Math.max(count, 1), 1000);

    // si aucune donnée encore, on génère pour TOUTES les colonnes existantes
    if (newData.length === 0) {
      const generated = generateMockData(newFields, safeCount);
      setData(generated);
    } else {
      // on remplit juste cette colonne dans les données existantes
      const generatedColumn = generateMockData([newFields[index]], safeCount);
      for (let i = 0; i < safeCount; i++) {
        if (!newData[i]) newData[i] = {};
        newData[i][newFields[index].name] =
          generatedColumn[i][newFields[index].name];
      }
      setData(newData);
    }

    setLoadingCols((prev) => prev.filter((i) => i !== index));
  };

  const handleAddField = () => {
    const unique = getUniqueName("col");
    setFields([...fields, { name: unique, type: "first_name" }]);
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    setData((prev) =>
      prev.map((row) => {
        const updated = { ...row };
        delete updated[fields[index].name];
        return updated;
      })
    );
  };

  const handleExport = () => {
    let content = "";
    let mime = "text/plain";
    let ext = exportType;
    switch (exportType) {
      case "csv":
        content = exportToCSV(data);
        mime = "text/csv";
        break;
      case "json":
        content = exportToJSON(data);
        mime = "application/json";
        break;
      case "sql":
        content = exportToSQL(data, "mock_data");
        mime = "application/sql";
        ext = "sql";
        break;
      case "postgres":
        content = exportToPostgres(data, "mock_data");
        mime = "application/sql";
        ext = "sql";
        break;
    }
    const blob = new Blob([content], { type: mime });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `data.${ext}`;
    link.click();
  };

  return (
    <main className="max-w-7xl mx-auto py-10 px-6">
      {/* --- HEADER --- */}
      <header className="flex justify-center sticky top-0 z-10 bg-white shadow-sm rounded-xl mb-8">
        <div className="max-w-[78rem] w-full px-4 pt-2">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Genata</h1>

            {/* <nav className="hidden md:flex space-x-8">
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Blog
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Support
              </a>
            </nav> */}

            <button className="ml-4 p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Intro below header */}
      <section className="mb-6 pt-4 pb-4">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Génération de données fictives personnalisées</h2>
        <p className="text-gray-600 mt-2 max-w-3xl text-center mx-auto">
          Créez rapidement des jeux de données réalistes en sélectionnant les types de colonnes (noms, emails, dates, IDs, etc.).
          Visualisez un aperçu puis exportez en CSV, JSON, ou en scripts SQL/Postgres pour alimenter vos bases de données et vos tests.
        </p>
      </section>

      {/* HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h3 className="text-2xl font-bold text-gray-900">
          Champs des données
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-wrap w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="count" className="text-sm text-gray-700">
              Nombre :
            </label>
            <Input
              id="count"
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full sm:w-24 text-center"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select value={exportType} onValueChange={(v) => setExportType(v as ExportType)}>
              <SelectTrigger className="w-full border rounded px-3 py-2">
              <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Format</SelectLabel>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="sql">SQL (générique)</SelectItem>
                  <SelectItem value="postgres">Postgres</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                {" "}
                <Download className="w-4 h-4 inline mr-1" />
                Exporter
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Téléchargement des données</AlertDialogTitle>
                <AlertDialogDescription>
                  Les données vont être générées et téléchargées sur votre
                  appareil au format sélectionné.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleExport}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleGenerate}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCcw className="w-4 h-4 inline mr-1" />
            Générer un visuel
          </Button>
        </div>
      </section>

      {/* TABLE (always show header; body only when data exists) */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field, index) => (
                <TableHead
                  key={index}
                  className="border-r pt-2 pb-2 border-gray-200 min-w-[240px]"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={field.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder="Nom de colonne"
                      className="w-[120px]"
                    />
                    <ComboboxTypeSelect
                      value={field.type}
                      onChange={(val) => handleTypeChange(index, val)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableHead>
              ))}

              <TableHead
                onClick={handleAddField}
                className="cursor-pointer text-blue-600 hover:bg-blue-50 transition text-center"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Ajouter une colonne
              </TableHead>
            </TableRow>
          </TableHeader>

          {data.length > 0 && (
            <TableBody>
              {Array.from({ length: Math.min(count, 10) }).map(
                (_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {fields.map((field, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className="border-r border-gray-100"
                      >
                        {loadingCols.includes(colIndex) ? (
                          <Skeleton className="h-5 w-full rounded-md" />
                        ) : (
                          data[rowIndex]?.[field.name] ?? ""
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </main>
  );
}

// -------------------
// 💬 Combobox Type
// -------------------
function ComboboxTypeSelect({
  value,
  onChange,
}: {
  value: FieldType;
  onChange: (value: FieldType) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = fieldOptions.find((f) => f.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[130px] justify-between"
        >
          {selected ? selected.label : "Type"}
          <ChevronsUpDown className="opacity-50 w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[160px]" side="right" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un type..." />
          <CommandList>
            <CommandEmpty>Aucun type trouvé</CommandEmpty>
            <CommandGroup>
              {fieldOptions.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
