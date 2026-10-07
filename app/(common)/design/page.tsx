"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PageContainer, PageTitle } from "@/components/overdrive/PageShell";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import {
  Button,
  CharCount,
  Checkbox,
  ChipGroup,
  Dialog,
  FieldLabel,
  IconButton,
  Input,
  Menu,
  MenuHeader,
  MenuItem,
  Panel,
  Price,
  SectionLabel,
  Select,
  Stat,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  Textarea,
  type ButtonVariant,
} from "@/components/ui";

const COLORS = [
  { group: "Surfaces", tokens: ["bg", "sunken", "panel", "raised", "border"] },
  { group: "Text", tokens: ["white", "text", "dim", "muted"] },
  { group: "Accents", tokens: ["teal", "teal-dark", "rose", "sky", "amber"] },
];

const TYPE_SCALE = [
  { cls: "text-micro", px: 10, use: "Badges, HUD captions" },
  { cls: "text-label", px: 11, use: "Labels, metadata" },
  { cls: "text-xs", px: 12, use: "Secondary UI" },
  { cls: "text-ui", px: 13, use: "Default UI text" },
  { cls: "text-sm", px: 14, use: "Long-form secondary" },
  { cls: "text-body", px: 15, use: "Body copy, card titles" },
  { cls: "text-lg", px: 18, use: "Row titles, section titles" },
  { cls: "text-2xl", px: 24, use: "Verdict readout" },
  { cls: "text-title", px: 28, use: "Page titles" },
  { cls: "text-4xl", px: 36, use: "Hero titles, big numerals" },
];

const ICONS: IconName[] = [
  "search", "heart", "heart-filled", "library", "grid", "list", "clock", "play",
  "close", "chevron-left", "chevron-right", "chevron-down", "chevron-up", "arrow-left",
  "arrow-right", "reminder", "send", "menu", "check", "plus", "comment", "reply",
  "spoiler", "edit", "user", "expand", "trend-down", "trend-up",
];

const BUTTON_VARIANTS: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "danger", "live"];

const GENRES = ["All", "RPG", "Indie", "Puzzle"].map((g) => ({ value: g, label: g }));
const SORTS = [
  { value: "rating", label: "Rating" },
  { value: "date", label: "Release date" },
  { value: "az", label: "A – Z" },
];
const RANGES = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
];

/// Living style guide: every token and component state, rendered from the
/// same components the app uses, so it can never drift from production.
export default function DesignSystemPage() {
  return (
    <PageContainer>
      <PageTitle title="DESIGN" accent=" SYSTEM" subtitle="overdrive tokens & components" />
      <p className="mb-10 max-w-[640px] text-sm leading-relaxed text-ov-dim">
        Every value below comes from the theme tokens in <code className="text-ov-teal">globals.css</code>{" "}
        and every component is the production one. Interactive primitives (tabs, select, menu,
        dialog, toggle groups, checkbox) are built on Radix for keyboard and screen-reader
        behavior; the styling layer is ours.
      </p>

      <Section title="COLOR">
        <ColorTokens />
      </Section>

      <Section title="TYPE SCALE">
        <div className="divide-y divide-ov-border border-y border-ov-border">
          {TYPE_SCALE.map((t) => (
            <div key={t.cls} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-3">
              <code className="w-24 shrink-0 text-label text-ov-teal">{t.cls}</code>
              <span className="w-12 shrink-0 text-label text-ov-muted">{t.px}px</span>
              <span className={`${t.cls} min-w-0 flex-1 text-ov-white`}>{t.use}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Panel className="p-5">
            <div className="mb-2 text-label text-ov-muted">Display · Orbitron</div>
            <div className="font-orbitron text-title font-black text-white">GAME//HUB 100</div>
          </Panel>
          <Panel className="p-5">
            <div className="mb-2 text-label text-ov-muted">UI · Chakra Petch</div>
            <div className="text-lg text-white">Track releases across every platform.</div>
          </Panel>
        </div>
      </Section>

      <Section title="CHAMFER">
        <div className="flex flex-wrap gap-6">
          {(["sm", "md", "lg"] as const).map((size) => (
            <div key={size} className="text-center">
              <div
                className={`ov-chamfer-x ${size === "md" ? "" : `ov-chamfer-${size}`} size-24 border border-ov-teal bg-ov-teal/6`}
              />
              <code className="mt-2 block text-label text-ov-dim">{size}</code>
            </div>
          ))}
          <div className="text-center">
            <div className="ov-chamfer size-24 border border-ov-border bg-ov-panel" />
            <code className="mt-2 block text-label text-ov-dim">br</code>
          </div>
        </div>
      </Section>

      <Section title="BUTTON">
        <div className="space-y-5">
          {BUTTON_VARIANTS.map((variant) => (
            <Row key={variant} label={variant}>
              <Button variant={variant} size="sm">
                SMALL
              </Button>
              <Button variant={variant} icon="play">
                MEDIUM
              </Button>
              <Button variant={variant} iconRight="chevron-right">
                TRAILING
              </Button>
              <Button variant={variant} loading>
                LOADING
              </Button>
              <Button variant={variant} disabled>
                DISABLED
              </Button>
            </Row>
          ))}
          <Row label="pressed">
            <PressedDemo />
          </Row>
          <Row label="lg">
            <div className="w-full max-w-[360px]">
              <Button variant="primary" size="lg">
                FULL-WIDTH CALL TO ACTION
              </Button>
            </div>
          </Row>
        </div>
      </Section>

      <Section title="ICON BUTTON">
        <Row label="variants">
          <IconButton icon="close" label="Ghost" />
          <IconButton icon="chevron-left" label="Outline" variant="outline" iconClassName="text-lg" />
          <span className="inline-flex bg-ov-raised p-3">
            <IconButton icon="heart" label="Overlay" variant="overlay" iconClassName="text-body" />
          </span>
          <span className="inline-flex bg-ov-raised p-3">
            <IconButton
              icon="heart-filled"
              label="Overlay pressed"
              variant="overlay"
              aria-pressed
              iconClassName="text-body"
            />
          </span>
        </Row>
      </Section>

      <Section title="TAG">
        <div className="space-y-3">
          <Row label="outline">
            <Tag tone="teal">PS5</Tag>
            <Tag tone="rose">Adventure</Tag>
            <Tag tone="neutral">Neutral</Tag>
          </Row>
          <Row label="solid">
            <Tag tone="teal" variant="solid" size="sm">
              RPG
            </Tag>
            <Tag tone="rose" variant="solid" size="sm">
              LIVE
            </Tag>
            <Tag tone="neutral" variant="solid" size="sm">
              DRAFT
            </Tag>
          </Row>
        </div>
      </Section>

      <Section title="SELECTION">
        <SelectionDemos />
      </Section>

      <Section title="TABS">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
            <TabsTrigger value="reviews">REVIEWS</TabsTrigger>
            <TabsTrigger value="media">MEDIA</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-ui text-ov-text">
            Arrow keys move between tabs; the panel is labelled by its tab.
          </TabsContent>
          <TabsContent value="reviews" className="text-ui text-ov-text">
            Reviews panel.
          </TabsContent>
          <TabsContent value="media" className="text-ui text-ov-text">
            Media panel.
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="FIELDS">
        <FieldDemos />
      </Section>

      <Section title="OVERLAYS">
        <OverlayDemos />
      </Section>

      <Section title="DATA">
        <div className="grid gap-px border border-ov-border bg-ov-border md:grid-cols-4">
          <Stat label="CURRENT" className="bg-ov-panel px-5 py-3">
            <Price size="xl" current="₹2,799" original="₹3,999" />
          </Stat>
          <Stat label="LOW · 30D" className="bg-ov-panel px-5 py-3">
            ₹2,799
          </Stat>
          <Stat label="HIGH · 30D" className="bg-ov-panel px-5 py-3">
            ₹3,999
          </Stat>
          <Stat label="CHANGE" className="bg-ov-panel px-5 py-3">
            <span className="inline-flex items-center gap-1 text-ov-teal">
              <OvIcon name="trend-down" className="text-sm" />
              Down ₹1,200
            </span>
          </Stat>
        </div>
      </Section>

      <Section title="PANEL">
        <div className="grid gap-4 md:grid-cols-3">
          <Panel className="p-5 text-ui text-ov-text">Static panel</Panel>
          <Panel cut="br" surface="sunken" className="p-5 text-ui text-ov-text">
            Sunken, bottom-right cut
          </Panel>
          <Panel asChild interactive className="p-5 text-ui text-ov-text">
            <button type="button">Interactive (hover / focus)</button>
          </Panel>
        </div>
      </Section>

      <Section title="ICONS">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
          {ICONS.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2 border border-ov-border px-2 py-3">
              <OvIcon name={name} className="text-lg text-ov-text" />
              <code className="text-micro text-ov-muted">{name}</code>
            </div>
          ))}
        </div>
      </Section>
    </PageContainer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-14">
      <SectionLabel bar className="mb-5">
        {title}
      </SectionLabel>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="w-20 shrink-0 text-label text-ov-muted">{label}</code>
      {children}
    </div>
  );
}

/// Swatches read their values from the live CSS variables, so the hex shown is
/// whatever the theme currently defines.
function ColorTokens() {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const { tokens } of COLORS) {
      for (const token of tokens) {
        next[token] = styles.getPropertyValue(`--color-ov-${token}`).trim();
      }
    }
    setValues(next);
  }, []);

  return (
    <div className="space-y-6">
      {COLORS.map(({ group, tokens }) => (
        <div key={group}>
          <div className="mb-2 text-label tracking-wide text-ov-dim">{group.toUpperCase()}</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
            {tokens.map((token) => (
              <div key={token} className="border border-ov-border">
                <div className="h-16" style={{ background: `var(--color-ov-${token})` }} />
                <div className="px-3 py-2">
                  <div className="text-xs text-ov-white">ov-{token}</div>
                  <code className="text-micro text-ov-muted">{values[token] || "…"}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PressedDemo() {
  const [inLib, setInLib] = useState(true);
  const [wished, setWished] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        icon={inLib ? "check" : "plus"}
        aria-pressed={inLib}
        onClick={() => setInLib((v) => !v)}
      >
        {inLib ? "IN LIBRARY" : "LIBRARY"}
      </Button>
      <Button
        variant={wished ? "danger" : "outline"}
        icon={wished ? "heart-filled" : "heart"}
        aria-pressed={wished}
        onClick={() => setWished((v) => !v)}
      >
        {wished ? "WISHLISTED" : "WISHLIST"}
      </Button>
    </>
  );
}

function SelectionDemos() {
  const [genre, setGenre] = useState("All");
  const [range, setRange] = useState("24h");
  const [sort, setSort] = useState("rating");
  const [spoilers, setSpoilers] = useState(false);
  const [hide, setHide] = useState(true);

  return (
    <div className="space-y-6">
      <Row label="chips">
        <ChipGroup label="Genre" options={GENRES} value={genre} onValueChange={setGenre} />
      </Row>
      <Row label="underline">
        <ChipGroup label="Range" variant="underline" options={RANGES} value={range} onValueChange={setRange} />
      </Row>
      <Row label="select">
        <Select label="Sort by" options={SORTS} value={sort} onValueChange={setSort} />
      </Row>
      <Row label="checkbox">
        <Checkbox checked={hide} onCheckedChange={setHide}>
          HIDE SPOILERS
        </Checkbox>
        <Checkbox tone="rose" checked={spoilers} onCheckedChange={setSpoilers}>
          CONTAINS SPOILERS
        </Checkbox>
      </Row>
    </div>
  );
}

function FieldDemos() {
  const [text, setText] = useState("");
  const tooLong = text.length > 40;
  return (
    <div className="grid max-w-[720px] gap-6 md:grid-cols-2">
      <div>
        <FieldLabel htmlFor="demo-email">EMAIL</FieldLabel>
        <Input id="demo-email" placeholder="player@grid.io" />
      </div>
      <div>
        <FieldLabel htmlFor="demo-invalid">INVALID</FieldLabel>
        <Input id="demo-invalid" defaultValue="not-an-email" invalid />
      </div>
      <div className="md:col-span-2">
        <div className="mb-2 flex items-baseline">
          <FieldLabel htmlFor="demo-body" className="mb-0">
            REVIEW
          </FieldLabel>
          <CharCount count={text.length} max={40} className="ml-auto" />
        </div>
        <Textarea
          id="demo-body"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          invalid={tooLong}
          placeholder="Type past 40 characters to see the invalid state…"
        />
      </div>
    </div>
  );
}

function OverlayDemos() {
  const [open, setOpen] = useState(false);
  return (
    <Row label="triggers">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        OPEN DIALOG
      </Button>
      <Menu
        align="start"
        trigger={
          <Button variant="outline" iconRight="chevron-down">
            OPEN MENU
          </Button>
        }
      >
        <MenuHeader>
          <div className="text-xs text-ov-white">neon_drifter</div>
          <div className="mt-0.5 text-micro text-ov-muted">player@grid.io</div>
        </MenuHeader>
        <MenuItem>PROFILE</MenuItem>
        <MenuItem tone="danger">SIGN OUT</MenuItem>
      </Menu>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        eyebrow="DIALOG"
        title="Focus is trapped in here"
        description="Example dialog from the design system page"
        className="max-w-[480px]"
      >
        <p className="px-5 py-5 text-ui leading-relaxed text-ov-text">
          Tab cycles within the dialog, Escape or a click outside closes it, and focus returns
          to the button that opened it.
        </p>
      </Dialog>
    </Row>
  );
}
