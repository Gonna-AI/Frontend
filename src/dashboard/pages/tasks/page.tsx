import { tasks } from "./components/data";
import { Tasks } from "./components/tasks";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl tracking-tight">Checklisten</h2>
        <p className="text-muted-foreground">
          Automatisch generierte To-dos aus dem Abgleich von Angebot und Bestellung.
        </p>
      </div>
      <Tasks data={tasks} />
    </div>
  );
}
