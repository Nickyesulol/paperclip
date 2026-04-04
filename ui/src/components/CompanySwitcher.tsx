import { ChevronsUpDown, Plus, Settings } from "lucide-react";
import { Link } from "@/lib/router";
import { useCompany } from "../context/CompanyContext";
import { Dropdown } from "@heroui/react";
import { Separator } from "@heroui/react";

function statusDotColor(status?: string): string {
  switch (status) {
    case "active":
      return "bg-green-400";
    case "paused":
      return "bg-yellow-400";
    case "archived":
      return "bg-neutral-400";
    default:
      return "bg-green-400";
  }
}

export function CompanySwitcher() {
  const { companies, selectedCompany, setSelectedCompanyId } = useCompany();
  const sidebarCompanies = companies.filter((company) => company.status !== "archived");

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <button className="w-full flex items-center justify-between px-2 py-1.5 h-auto text-left rounded-md hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            {selectedCompany && (
              <span className={`h-2 w-2 rounded-full shrink-0 ${statusDotColor(selectedCompany.status)}`} />
            )}
            <span className="text-sm font-medium truncate">
              {selectedCompany?.name ?? "Select company"}
            </span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Content>
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Companies</div>
        <Separator />
        {sidebarCompanies.map((company) => (
          <Dropdown.Item
            key={company.id}
            onPress={() => setSelectedCompanyId(company.id)}
            className={company.id === selectedCompany?.id ? "bg-accent" : ""}
          >
            <span className={`h-2 w-2 rounded-full shrink-0 mr-2 ${statusDotColor(company.status)}`} />
            <span className="truncate">{company.name}</span>
          </Dropdown.Item>
        ))}
        {sidebarCompanies.length === 0 && (
          <Dropdown.Item isDisabled>No companies</Dropdown.Item>
        )}
        <Separator />
        <Dropdown.Item>
          <Link to="/company/settings" className="no-underline text-inherit flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Company Settings
          </Link>
        </Dropdown.Item>
        <Dropdown.Item>
          <Link to="/companies" className="no-underline text-inherit flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Manage Companies
          </Link>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  );
}
