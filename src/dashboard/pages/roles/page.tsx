import { Roles } from "./components/roles";
import { roles } from "./components/roles-table/data";

export default function Page() {
  return <Roles roles={roles} />;
}
