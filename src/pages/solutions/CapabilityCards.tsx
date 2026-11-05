import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Check, CheckCheck, ChevronRight, FileText } from "lucide-react";
import ClerkTreeLogo from "../../components/Brand/ClerkTreeLogo";
import { useLanguage } from "../../contexts/LanguageContext";
import { operationsCopy, type Labels } from "./operationsCopy";
import "./CapabilityCards.css";

const vars = (v: Record<string, string | number>) => v as CSSProperties;
const VALUES = ["6205-2RS", "45 Nm", "± 0.02 mm", "2,000 h"];
const WAVE = Array.from(
  { length: 150 },
  (_, i) =>
    `${i ? "L" : "M"}${i * 4},${(43 + Math.sin(i * 2.23) * (i > 70 ? 13 : 4) + Math.sin(i * 0.69) * (i > 70 ? 8 : 3)).toFixed(1)}`,
).join(" ");

function Chip({
  children,
  hot = false,
}: {
  children: ReactNode;
  hot?: boolean;
}) {
  return (
    <span className={`cx-status${hot ? " is-hot" : ""}`}>
      <i />
      {children}
    </span>
  );
}

function SpindleModel({
  l,
  recovered = false,
}: {
  l: Labels;
  recovered?: boolean;
}) {
  return (
    <div className={`cx-model${recovered ? " is-recovered" : ""}`}>
      <div className="cx-model__coordinate">
        CNC-07 / SPINDLE · X 024 / Y 018 / Z 007
      </div>
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label={`${l.spindle}: ${l.bearing}`}
      >
        <defs>
          <linearGradient id="cx-metal" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#777b7f" />
            <stop offset=".19" stopColor="#393b3d" />
            <stop offset=".46" stopColor="#585a5d" />
            <stop offset=".53" stopColor="#252627" />
            <stop offset="1" stopColor="#0e0e0e" />
          </linearGradient>
          <linearGradient id="cx-face" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#8c9093" />
            <stop offset=".5" stopColor="#292a2b" />
            <stop offset="1" stopColor="#161718" />
          </linearGradient>
          <linearGradient id="cx-shaft" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#a4a7aa" />
            <stop offset=".28" stopColor="#4c4e50" />
            <stop offset=".52" stopColor="#c4c5c7" />
            <stop offset=".63" stopColor="#46484b" />
            <stop offset="1" stopColor="#18191a" />
          </linearGradient>
          <radialGradient id="cx-halo">
            <stop
              stopColor={recovered ? "#94989b" : "#ff7337"}
              stopOpacity=".19"
            />
            <stop offset="1" stopColor="#161617" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="cx-grid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 0H0V30"
              fill="none"
              stroke="#939699"
              strokeOpacity=".075"
            />
          </pattern>
        </defs>
        <rect width="600" height="300" fill="url(#cx-grid)" />
        <ellipse cx="320" cy="165" rx="210" ry="130" fill="url(#cx-halo)" />
        <g transform="translate(72 40) rotate(-12 235 125)">
          <path
            d="M24 179H450M87 52V222M387 52V222"
            stroke="#7c8084"
            strokeOpacity=".22"
            strokeDasharray="3 5"
          />
          <path
            d="M131 71H338V173H131Z"
            fill="url(#cx-metal)"
            stroke="#73777b"
            strokeWidth=".7"
          />
          <ellipse
            cx="131"
            cy="122"
            rx="28"
            ry="51"
            fill="url(#cx-face)"
            stroke="#95989c"
            strokeWidth=".8"
          />
          <ellipse
            cx="338"
            cy="122"
            rx="28"
            ry="51"
            fill="url(#cx-face)"
            stroke="#83868a"
            strokeWidth=".8"
          />
          {Array.from({ length: 15 }, (_, i) => (
            <path
              key={i}
              d={`M${149 + i * 11} 73V171`}
              stroke="#b0b2b4"
              strokeOpacity=".12"
            />
          ))}
          <path
            d="M61 109H407V135H61Z"
            fill="url(#cx-shaft)"
            stroke="#a1a3a6"
            strokeWidth=".6"
          />
          <ellipse
            cx="61"
            cy="122"
            rx="8"
            ry="13"
            fill="url(#cx-face)"
            stroke="#a6a8ab"
            strokeWidth=".7"
          />
          <ellipse
            cx="407"
            cy="122"
            rx="8"
            ry="13"
            fill="url(#cx-face)"
            stroke="#a6a8ab"
            strokeWidth=".7"
          />
          <g
            className="cx-model__bearing"
            fill="none"
            stroke={recovered ? "#a3a6a9" : "#f78250"}
          >
            <ellipse cx="298" cy="122" rx="24" ry="45" strokeWidth="1.3" />
            <ellipse cx="298" cy="122" rx="16" ry="33" strokeWidth=".6" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <ellipse
                  key={i}
                  cx={298 + Math.cos(a) * 20}
                  cy={122 + Math.sin(a) * 39}
                  rx="3"
                  ry="4"
                  fill={recovered ? "#6c6f72" : "#6f7275"}
                  strokeWidth=".5"
                />
              );
            })}
          </g>
          <path
            d="M103 71V173M112 71V173M349 80V164"
            stroke="#a7aaad"
            strokeOpacity=".4"
          />
          <path
            d="M184 175L173 201H224L235 175M281 175L270 201H321L332 175"
            fill="url(#cx-metal)"
            stroke="#6f7276"
            strokeWidth=".7"
          />
          <path
            d="M124 204H370M124 200V208M370 200V208"
            stroke="#7b7f83"
            strokeOpacity=".55"
          />
          <text
            x="240"
            y="220"
            fill="#7b7f83"
            fontSize="8"
            textAnchor="middle"
            fontFamily="monospace"
          >
            246.00 mm
          </text>
        </g>
        <path
          d="M353 134L403 73H546"
          fill="none"
          stroke={recovered ? "#94979a" : "#eb8559"}
          strokeWidth=".8"
        />
        <circle
          cx="353"
          cy="134"
          r="3"
          fill={recovered ? "#94979a" : "#ff8754"}
        />
        <text
          x="418"
          y="62"
          fill={recovered ? "#bcbebf" : "#f6a481"}
          fontSize="9"
          fontFamily="monospace"
        >
          6205-2RS / DE
        </text>
        <path
          d="M54 260h18m-9-9v18M546 260h18m-9-9v18"
          stroke="#7b7f83"
          strokeOpacity=".4"
        />
      </svg>
      <div className="cx-model__legend">
        <span>
          <i />
          {l.spindle}
        </span>
        <span className="cx-model__focus">{l.bearing}</span>
      </div>
    </div>
  );
}

function SignalScene({ l, frame }: { l: Labels; frame: number }) {
  const alarm = frame >= 9 && frame < 34;
  const status =
    frame < 9
      ? l.live
      : frame < 17
        ? l.correlating
        : frame < 28
          ? l.detected
          : frame < 34
            ? l.incident
            : l.normal;
  return (
    <div className={`cx-signal-scene${alarm ? " has-anomaly" : ""}`}>
      <div className="cx-source-chips">
        <span>OPC UA</span>
        <span>CNC-07</span>
        <span>SP-204</span>
      </div>
      <SpindleModel l={l} recovered={!alarm} />
      <div className="cx-signal-stream">
        <div className="cx-signal-stream__labels">
          <span>
            {l.vibration}
            <strong>
              {alarm ? "7.8" : "2.1"}
              <small>mm/s</small>
            </strong>
          </span>
          <span>
            {l.temperature}
            <strong>
              {alarm ? "84" : "62"}
              <small>°C</small>
            </strong>
          </span>
          <Chip hot={alarm}>{status}</Chip>
        </div>
        <div className="cx-wave">
          <svg
            viewBox="0 0 600 86"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 17H600M0 43H600M0 69H600" className="cx-wave__grid" />
            <path d={WAVE} className="cx-wave__trace" />
            <path d={WAVE} className="cx-wave__energy" />
          </svg>
          <span className="cx-wave__sweep" />
        </div>
      </div>
      <div
        className={`cx-signal-result${frame >= 22 && frame < 34 ? " is-in" : ""}`}
      >
        <div>
          <strong>
            SP-204 <span>→</span> INC-0248
          </strong>
          <small>{l.linked}</small>
        </div>
        <Check size={14} />
      </div>
    </div>
  );
}

function StreamingResponse({
  text,
  frame,
  start = 8,
}: {
  text: string;
  frame: number;
  start?: number;
}) {
  const length = Math.max(0, (frame - start) * 16);
  const streaming = length < text.length;
  return (
    <p className="cx-ai-response">
      {length ? (
        text.slice(0, length)
      ) : (
        <span className="cx-ai-placeholder">
          <i />
          <i />
        </span>
      )}
      {length > 0 && streaming && <span className="cx-ai-caret" />}
    </p>
  );
}

function AssistantHeader({ l, working }: { l: Labels; working: boolean }) {
  return (
    <div className={`cx-assistant-header${working ? " is-generating" : ""}`}>
      <span className="cx-ai-mark">
        <ClerkTreeLogo markClassName="cx-logo" labelClassName="sr-only" />
      </span>
      <strong>{l.assistant}</strong>
      <span className="cx-ai-state">
        {working ? <span className="cx-shimmer">{l.generating}</span> : l.done}
        {!working && <CheckCheck size={11} />}
      </span>
    </div>
  );
}

function Attachment({
  title,
  meta,
  type = "PDF",
}: {
  title: string;
  meta: string;
  type?: string;
}) {
  return (
    <div className="cx-attachment">
      <span>
        <FileText size={14} />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      <code>{type}</code>
    </div>
  );
}

function AgentScene({ l, frame }: { l: Labels; frame: number }) {
  const step = Math.min(4, Math.floor(frame / 7));
  const complete = frame >= 28;
  return (
    <div className="cx-product-scene cx-product-scene--agent">
      <div className="cx-glass cx-product-window">
        <div className="cx-product-tube">
          <div className="cx-product-context">
            <span>
              <span className="cx-tiny-dot" />
              INC-0248
            </span>
            <span>
              CNC-07 <ChevronRight size={9} /> SP-204
            </span>
          </div>
          <div className="cx-user-request">
            <p>{l.agentPrompt}</p>
          </div>
          <AssistantHeader l={l} working={frame < 18} />
          <StreamingResponse text={l.agentResponse} frame={frame} start={3} />
          <div className="cx-tool-results">
            {l.steps.map((text, i) => (
              <div
                key={text}
                className={`${step > i ? "is-done" : step === i ? "is-working" : ""}`}
              >
                <span>{step > i ? <Check size={9} /> : <i />}</span>
                <div>
                  <strong>{text}</strong>
                  <small>
                    {step > i ? l.results[i] : step === i ? l.running : "—"}
                  </small>
                </div>
                {step === i && <span className="cx-tool-spinner" />}
              </div>
            ))}
          </div>
          <div className={`cx-generated-order${complete ? " is-ready" : ""}`}>
            <div>
              <strong>
                {l.workorder}
                <span> · </span>
                {l.workorderTitle}
              </strong>
              <small>{complete ? l.waiting : l.workorderMeta}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentScene({ l, frame }: { l: Labels; frame: number }) {
  const count = Math.min(4, Math.floor(Math.max(0, frame - 3) / 6));
  const values =
    l.fields[0] === "Teilenummer"
      ? ["6205-2RS", "45 Nm", "± 0,02 mm", "2.000 h"]
      : VALUES;
  return (
    <div className="cx-source-extraction">
      <div className="cx-glass cx-product-window">
        <div className="cx-product-tube">
          <Attachment title={l.manual} meta="CNC-07 · REV C · 64 p." />
          <div className="cx-extract-heading">
            <strong className={count < 4 ? "cx-shimmer" : undefined}>
              {count < 4 ? l.extracting : l.cited}
            </strong>
            <span>{String(count).padStart(2, "0")} / 04</span>
          </div>
          <div className="cx-source-excerpt">
            <div>
              <span>SOURCE DOCUMENT</span>
              <code>§4.2 / P.37</code>
            </div>
            {l.sentences
              .filter((_, i) => i === Math.min(count, 3))
              .map((sentence) => (
                <p
                  key={sentence}
                  className={count < 4 ? "is-reading" : "is-extracted"}
                >
                  <span>{String(Math.min(count, 3) + 1).padStart(2, "0")}</span>
                  <span>{sentence}</span>
                  {count === 4 && <Check size={8} />}
                </p>
              ))}
          </div>
          <div className="cx-extract-transfer">
            <span />
            <small>{l.structured}</small>
            <span />
          </div>
          <div className="cx-data-fields">
            {l.fields.map((field, i) => (
              <div
                key={field}
                className={`cx-answer-field${count > i ? " is-filled" : ""}`}
              >
                <span>{field}</span>
                <strong>
                  {count > i ? values[i] : <i className="cx-value-skeleton" />}
                </strong>
                <small>
                  {count > i ? (
                    <>§{i < 2 ? "4.2" : i === 2 ? "4.3" : "6.1"}</>
                  ) : (
                    "···"
                  )}
                </small>
              </div>
            ))}
          </div>
          <div className="cx-product-footer">
            <span>{count === 4 ? l.cited : l.reading}</span>
            <code>CNC-07</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function RfqScene({
  l,
  frame,
  language,
}: {
  l: Labels;
  frame: number;
  language: string;
}) {
  const recommended = frame >= 22;
  return (
    <div className="cx-quote-workspace">
      <div className="cx-glass cx-product-window">
        <div className="cx-product-tube">
          <Attachment
            title="RFQ-1182 · 6205-2RS"
            meta={`${language === "de" ? "3 Angebote" : "3 offers"} · Ø25 × Ø52 × 15 mm`}
            type="RFQ"
          />
          <div className="cx-quote-heading">
            <div>
              <strong>{l.compareTitle}</strong>
              <span>{l.replenishment}</span>
            </div>
            <Chip hot={!recommended}>{recommended ? l.done : l.comparing}</Chip>
          </div>
          <div className="cx-quote-requirements">
            <span>
              <Check size={8} />
              DIN 625
            </span>
            <span>6205-2RS</span>
            <span>Ø25 × Ø52</span>
            <span>× 4</span>
          </div>
          <div className="cx-quote-progress">
            <i style={{ width: `${Math.min(100, (frame / 22) * 100)}%` }} />
          </div>
          <div className="cx-comparison">
            <div className="cx-comparison__head">
              <span>{l.supplier}</span>
              <span>{l.price}</span>
              <span>{l.lead}</span>
            </div>
            {["Kessler Industrie", "Nordwerk Supply", "Präzision Bayern"].map(
              (name, i) => (
                <div
                  key={name}
                  className={`cx-comparison-row${frame > 3 + i * 5 ? " is-in" : ""}${recommended && i === 0 ? " is-best" : ""}`}
                >
                  <div>
                    <span>{name[0]}</span>
                    <div>
                      <strong>{name}</strong>
                      <small>
                        {recommended && i === 0
                          ? l.recommended
                          : "DIN 625 · 6205-2RS"}
                      </small>
                    </div>
                  </div>
                  <code>
                    {new Intl.NumberFormat(
                      language === "de" ? "de-DE" : "en-IE",
                      { style: "currency", currency: "EUR" },
                    ).format([38.6, 44, 41.2][i])}
                  </code>
                  <span>
                    {[2, 1, 5][i]} {l.days}
                  </span>
                </div>
              ),
            )}
          </div>
          <div
            className={`cx-supplier-recommendation${recommended ? " is-ready" : ""}`}
          >
            <div>
              <small>{l.recommended}</small>
              <strong>Kessler Industrie</strong>
              <p>{l.quoteReason}</p>
            </div>
            <CheckCheck size={14} />
          </div>
          <div className="cx-product-footer">
            <span className={recommended ? undefined : "cx-shimmer"}>
              {recommended ? l.sourceCount : l.reading}
            </span>
            <code>RFQ-1182</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphScene({ l, frame }: { l: Labels; frame: number }) {
  const paths = [
    "M97 74C97 47 179 56 179 42",
    "M97 120C97 151 130 159 151 159",
    "M97 120C97 156 75 177 75 207",
  ];
  const nodes = [
    { x: 150.5, y: 12.5, name: "CNC-07", meta: "ASSET", at: 3 },
    { x: 150.5, y: 144.5, name: "WO-2176", meta: "2025", at: 12 },
    { x: 14.5, y: 206.5, name: languageLabel(l), meta: "§4.2", at: 20 },
  ];
  return (
    <div className="cx-lattice">
      <svg viewBox="0 0 280 248" role="presentation">
        <defs>
          <linearGradient id="cx-lat-card" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#242627" />
            <stop offset="1" stopColor="#171818" />
          </linearGradient>
          <linearGradient id="cx-lat-chip" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#212223" />
            <stop offset="1" stopColor="#161718" />
          </linearGradient>
          <linearGradient id="cx-lat-lit" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#ffb190" stopOpacity=".1" />
            <stop offset="1" stopColor="#ff9b70" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="cx-lat-glow">
            <stop stopColor="#ff7d46" stopOpacity=".13" />
            <stop offset="1" stopColor="#ff7d46" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="cx-lat-dots"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <rect width="1.2" height="1.2" fill="#ffffff" opacity=".11" />
          </pattern>
          <radialGradient id="cx-lat-mask">
            <stop stopColor="white" />
            <stop offset="1" stopColor="black" />
          </radialGradient>
          <mask id="cx-lat-fade">
            <rect width="280" height="248" fill="url(#cx-lat-mask)" />
          </mask>
        </defs>
        <rect
          width="280"
          height="248"
          fill="url(#cx-lat-dots)"
          mask="url(#cx-lat-fade)"
        />
        <ellipse cx="100" cy="97" rx="124" ry="78" fill="url(#cx-lat-glow)" />
        {paths.map((d, i) => (
          <g
            key={d}
            className={`cx-lattice-link${frame > i * 6 + 4 ? " is-in" : ""}`}
          >
            <path d={d} />
            <path
              className="cx-lattice-energy"
              d={d}
              style={vars({ "--flow-delay": `${i * -0.9}s` })}
            />
          </g>
        ))}
        <g className="cx-lattice-hub">
          <rect
            x="12"
            y="72"
            width="170"
            height="50"
            rx="14"
            fill="#ff834e"
            opacity=".035"
          />
          <rect
            x="14.5"
            y="74.5"
            width="165"
            height="45"
            rx="12"
            fill="url(#cx-lat-card)"
            stroke="#717478"
            strokeWidth=".65"
          />
          <rect
            x="15"
            y="75"
            width="164"
            height="23"
            rx="12"
            fill="url(#cx-lat-lit)"
          />
          <rect
            x="23"
            y="83"
            width="28"
            height="28"
            rx="8"
            fill="#3c3e3f"
            fillOpacity=".55"
          />
          <g stroke="#93969a" fill="none" strokeWidth=".9">
            <circle cx="37" cy="97" r="6.5" />
            <circle cx="37" cy="97" r="2.5" />
            <path d="M37 89v3M37 102v3M29 97h3M42 97h3" />
          </g>
          <text x="60" y="91" className="cx-lattice-title">
            {l.failure}
          </text>
          <text x="60" y="106" className="cx-lattice-fact">
            {l.similarity}
          </text>
          <circle
            cx="97"
            cy="74"
            r="2.2"
            fill="#262728"
            stroke="#979a9d"
            strokeWidth=".6"
          />
          <circle
            cx="97"
            cy="120"
            r="2.2"
            fill="#262728"
            stroke="#979a9d"
            strokeWidth=".6"
          />
        </g>
        {nodes.map((node, i) => (
          <g
            key={node.name}
            className={`cx-lattice-node${frame >= node.at ? " is-in" : ""}`}
          >
            <rect
              x={node.x}
              y={node.y}
              width="121"
              height="29"
              rx="8"
              fill="url(#cx-lat-chip)"
              stroke="#8c8f92"
              strokeOpacity=".4"
              strokeWidth=".65"
            />
            <g
              transform={`translate(${node.x + 15} ${node.y + 14.5})`}
              stroke="#9a9da0"
              fill="none"
              strokeWidth=".8"
            >
              {i === 0 ? (
                <>
                  <rect x="-4" y="-5" width="8" height="9" rx="1.4" />
                  <path d="M-2 6h4M0 4v2M-2-2h4" />
                </>
              ) : i === 1 ? (
                <>
                  <path d="M-4-5h7v10h-7zM-2-2h3M-2 0h3M-2 2h2" />
                </>
              ) : (
                <>
                  <path d="M-5-5h4q1 0 1 1v10q-1-2-5-1zM5-5H1q-1 0-1 1v10q1-2 5-1z" />
                </>
              )}
            </g>
            <text x={node.x + 28.5} y={node.y + 18} className="cx-lattice-name">
              {node.name}
            </text>
            <text
              x={node.x + 111}
              y={node.y + 18}
              textAnchor="end"
              className="cx-lattice-more"
            >
              {node.meta}
            </text>
          </g>
        ))}
      </svg>
      <div className={`cx-lattice-result${frame >= 28 ? " is-in" : ""}`}>
        <CheckCheck size={11} />
        {l.resolved}
      </div>
    </div>
  );
}
const languageLabel = (l: Labels) =>
  l.knowledge.startsWith("Manual") ? "Manual" : "Handbuch";

function ProductionScene({ l, frame }: { l: Labels; frame: number }) {
  const pressure = frame >= 9 && frame < 24;
  const recovered = frame >= 28;
  const index = 3 + (Math.floor(frame / 5) % 3);
  const heights = Array.from({ length: 12 }, (_, i) =>
    Math.round(
      [24, 30, 38, 48, 57, 69, 82, 96, 86, 74, 65, 72][i] -
        (pressure && i >= index && i <= index + 2 ? 22 : 0) +
        (recovered ? 4 : 0),
    ),
  );
  return (
    <div
      className={`cx-production-scene${pressure ? " has-pressure" : ""}${recovered ? " is-recovered" : ""}`}
    >
      <div className="cx-production-metrics">
        <div>
          <span>{l.oee}</span>
          <strong>
            {recovered ? "91.2" : pressure ? "78.4" : "86.8"}
            <small>%</small>
          </strong>
          <i>{recovered ? "+12.8 pp" : "LINE 03 / CNC"}</i>
        </div>
        <div>
          <span>{l.throughput}</span>
          <strong>
            {recovered ? "248" : pressure ? "186" : "232"}
            <small>{l.units}</small>
          </strong>
          <i>{recovered ? l.cleared : l.monitoring}</i>
        </div>
        <Chip hot={pressure}>
          {pressure ? l.queue : recovered ? l.normal : l.live}
        </Chip>
      </div>
      <div className="cx-production-plot">
        <div className="cx-production-grid">
          <span>300</span>
          <span>200</span>
          <span>100</span>
        </div>
        <div className="cx-production-bars">
          {heights.map((h, i) => (
            <span
              key={i}
              className={
                pressure && i >= index && i <= index + 2 ? "is-dip" : ""
              }
              style={vars({
                "--bar-height": `${h}%`,
                "--bar-delay": `${i * -0.16}s`,
              })}
            >
              <i />
            </span>
          ))}
        </div>
        <div
          className={`cx-queue-label${pressure ? " is-in" : ""}`}
          style={{ left: `${Math.min(62, (index / 12) * 100)}%` }}
        >
          <span />
          {l.queue}
        </div>
      </div>
      <div className="cx-production-axis">
        <span>06:00</span>
        <span>09:00</span>
        <span>12:00</span>
        <span>15:00</span>
        <span>18:00</span>
      </div>
      <div className="cx-schedule">
        <div className="cx-schedule__title">
          <span>
            {pressure
              ? l.reschedule
              : recovered
                ? l.proposal
                : "LINE 03 / " + l.batch}
          </span>
          <code>14:30–15:15</code>
        </div>
        <div className="cx-schedule__lanes">
          <span>CNC-07</span>
          <div>
            <i style={{ width: recovered ? "29%" : "45%" }}>{l.batch} 12</i>
            <i className={`cx-schedule__window${frame >= 23 ? " is-in" : ""}`}>
              45m
            </i>
            <i>{l.batch} 13</i>
          </div>
          <span>CNC-08</span>
          <div>
            <i style={{ width: recovered ? "50%" : "33%" }}>{l.batch} 09</i>
            <i>{l.batch} 10</i>
          </div>
        </div>
      </div>
      <div className={`cx-production-result${recovered ? " is-in" : ""}`}>
        <CheckCheck size={12} />
        {l.cleared}
        <span>186 → 248 {l.units}</span>
      </div>
    </div>
  );
}

function AnimatedCard({
  title,
  body,
  id,
  wide,
  children,
  index,
  reduced,
}: {
  title: string;
  body: string;
  id: string;
  wide?: boolean;
  children: (frame: number) => ReactNode;
  index: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [frame, setFrame] = useState(0);
  const live = visible && pageVisible && !reduced;
  const intervalMs = id === "agent" ? 160 : 320;
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setRevealed(true);
      },
      { threshold: 0.12 },
    );
    if (ref.current) observer.observe(ref.current);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(
      () => setFrame((n) => (n + 1) % 40),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [live, intervalMs]);
  return (
    <article
      ref={ref}
      id={`cx-${id}`}
      className={`cx-card cx-card--${id}${wide ? " cx-card--wide" : ""}${live ? " is-live" : ""}${revealed ? " is-revealed" : ""}`}
      style={vars({ "--reveal-delay": `${(index % 2) * 100}ms` })}
      aria-labelledby={`cx-${id}-title`}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--mx",
          `${event.clientX - box.left}px`,
        );
        event.currentTarget.style.setProperty(
          "--my",
          `${event.clientY - box.top}px`,
        );
      }}
    >
      <div className="cx-spotlight" aria-hidden="true" />
      {id === "agent" && <span className="cx-border-beam" aria-hidden="true" />}
      <div className="cx-card__visual" aria-hidden="true">
        {children(reduced ? 32 : frame)}
      </div>
      <div className="cx-card__copy">
        <h3 id={`cx-${id}-title`}>{title}</h3>
        <p>{body}</p>
      </div>
    </article>
  );
}

export default function CapabilityCards() {
  const { language, t } = useLanguage();
  const l = operationsCopy[language === "de" ? "de" : "en"];
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const cards = [
    {
      id: "signal",
      title: t("solutions.card1Title"),
      body: t("solutions.card1Desc"),
      wide: true,
      render: (frame: number) => <SignalScene l={l} frame={frame} />,
    },
    {
      id: "agent",
      title: t("solutions.card2Title"),
      body: t("solutions.card2Desc"),
      render: (frame: number) => <AgentScene l={l} frame={frame} />,
    },
    {
      id: "docs",
      title: l.docTitle,
      body: l.docBody,
      render: (frame: number) => <DocumentScene l={l} frame={frame} />,
    },
    {
      id: "rfq",
      title: l.rfqTitle,
      body: l.rfqBody,
      wide: true,
      render: (frame: number) => (
        <RfqScene l={l} frame={frame} language={language} />
      ),
    },
    {
      id: "graph",
      title: t("solutions.card3Title"),
      body: t("solutions.card3Desc"),
      render: (frame: number) => <GraphScene l={l} frame={frame} />,
    },
    {
      id: "production",
      title: t("solutions.card5Title"),
      body: t("solutions.card5Desc"),
      wide: true,
      render: (frame: number) => <ProductionScene l={l} frame={frame} />,
    },
  ];
  return (
    <section className="cx-section" aria-labelledby="cx-title">
      <header className="cx-heading">
        <p className="cx-eyebrow">
          <span />
          {l.eyebrow}
        </p>
        <h2 id="cx-title">
          {l.title[0]}
          <br />
          <span>{l.title[1]}</span>
        </h2>
        <div>
          <p>{l.intro}</p>
          <span className="cx-demo-label">{l.demo}</span>
        </div>
      </header>
      <div className="cx-grid">
        {cards.map((card, index) => (
          <AnimatedCard
            key={card.id}
            title={card.title}
            body={card.body}
            id={card.id}
            wide={card.wide}
            index={index}
            reduced={reduced}
          >
            {card.render}
          </AnimatedCard>
        ))}
      </div>
    </section>
  );
}
