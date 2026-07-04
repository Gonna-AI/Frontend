import { initialBoard } from "./components/data";
import { Kanban } from "./components/kanban";

export default function Page() {
  return (
    <div data-content-padding="false">
      <Kanban initialBoard={initialBoard} />
    </div>
  );
}
