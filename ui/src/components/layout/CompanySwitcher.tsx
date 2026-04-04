import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Popover } from "@heroui/react";
import { useCompany } from "../../context/CompanyContext";
import { useDialog } from "../../context/DialogContext";
import { useNavigate } from "@/lib/router";
import type { Company } from "@paperclipai/shared";

function companyStatusColor(status?: string): string {
  switch (status) {
    case "active":
      return "#4ade80"; // green-400
    case "paused":
      return "#facc15"; // yellow-400
    case "archived":
      return "#a3a3a3"; // neutral-400
    default:
      return "#4ade80";
  }
}

function CompanyAvatar({ company }: { company: Company }) {
  const color = company.brandColor ?? companyStatusColor(company.status);
  const initials = company.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function CompanySwitcher() {
  const { companies, selectedCompany, setSelectedCompanyId } = useCompany();
  const { openOnboarding } = useDialog();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const visibleCompanies = companies.filter((c) => c.status !== "archived");

  function handleSelect(companyId: string) {
    setSelectedCompanyId(companyId, { source: "manual" });
    setOpen(false);
    navigate(`/`);
  }

  function handleCreateCompany() {
    setOpen(false);
    openOnboarding();
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch company"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-[var(--color-subtle,theme(colors.neutral.100))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring,theme(colors.blue.500))] dark:hover:bg-[var(--color-subtle,theme(colors.neutral.800))]"
      >
        {selectedCompany ? (
          <CompanyAvatar company={selectedCompany} />
        ) : (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-700" />
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium leading-tight text-[var(--color-foreground,theme(colors.neutral.900))] dark:text-[var(--color-foreground,theme(colors.neutral.100))]">
            {selectedCompany?.name ?? "Select company"}
          </span>
          {selectedCompany?.issuePrefix && (
            <span className="block truncate text-[11px] leading-tight text-[var(--color-muted-foreground,theme(colors.neutral.500))] dark:text-[var(--color-muted-foreground,theme(colors.neutral.400))]">
              {selectedCompany.issuePrefix.toUpperCase()}
            </span>
          )}
        </span>

        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted-foreground,theme(colors.neutral.500))] transition-transform duration-150 dark:text-[var(--color-muted-foreground,theme(colors.neutral.400))]"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      <Popover.Content
        placement="bottom start"
        offset={4}
        className="w-56 min-w-[14rem] p-0"
      >
        <Popover.Dialog className="overflow-hidden rounded-lg border border-[var(--color-border,theme(colors.neutral.200))] bg-[var(--color-background,white)] shadow-md dark:border-[var(--color-border,theme(colors.neutral.700))] dark:bg-[var(--color-background,theme(colors.neutral.900))]">
          {/* Company list */}
          <ul
            role="listbox"
            aria-label="Companies"
            className="max-h-72 overflow-y-auto py-1"
          >
            {visibleCompanies.length === 0 && (
              <li className="px-3 py-2 text-sm text-[var(--color-muted-foreground,theme(colors.neutral.500))]">
                No companies
              </li>
            )}
            {visibleCompanies.map((company) => {
              const isSelected = company.id === selectedCompany?.id;
              return (
                <li key={company.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(company.id)}
                    className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left transition-colors duration-100 hover:bg-[var(--color-subtle,theme(colors.neutral.100))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-ring,theme(colors.blue.500))] dark:hover:bg-[var(--color-subtle,theme(colors.neutral.800))]"
                  >
                    <CompanyAvatar company={company} />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[var(--color-foreground,theme(colors.neutral.900))] dark:text-[var(--color-foreground,theme(colors.neutral.100))]">
                        {company.name}
                      </span>
                      <span className="block truncate text-[11px] text-[var(--color-muted-foreground,theme(colors.neutral.500))] dark:text-[var(--color-muted-foreground,theme(colors.neutral.400))]">
                        {company.issuePrefix.toUpperCase()}
                      </span>
                    </span>

                    {isSelected && (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary,theme(colors.blue.500))]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Divider + Create action */}
          <div className="border-t border-[var(--color-border,theme(colors.neutral.200))] py-1 dark:border-[var(--color-border,theme(colors.neutral.700))]">
            <button
              type="button"
              onClick={handleCreateCompany}
              className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left text-sm text-[var(--color-muted-foreground,theme(colors.neutral.600))] transition-colors duration-100 hover:bg-[var(--color-subtle,theme(colors.neutral.100))] hover:text-[var(--color-foreground,theme(colors.neutral.900))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-ring,theme(colors.blue.500))] dark:text-[var(--color-muted-foreground,theme(colors.neutral.400))] dark:hover:bg-[var(--color-subtle,theme(colors.neutral.800))] dark:hover:text-[var(--color-foreground,theme(colors.neutral.100))]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-dashed border-[var(--color-border,theme(colors.neutral.300))] dark:border-[var(--color-border,theme(colors.neutral.600))]">
                <Plus className="h-3 w-3" aria-hidden="true" />
              </span>
              Create company
            </button>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
