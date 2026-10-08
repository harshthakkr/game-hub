"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PageContainer } from "@/components/overdrive/PageShell";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import { VerdictBadge } from "@/components/overdrive/reviews/VerdictBadge";
import { VERDICTS } from "@/utils/reviews";
import {
  Button,
  CharCount,
  Checkbox,
  ChipGroup,
  Dialog,
  Eyebrow,
  FieldLabel,
  IconButton,
  Input,
  Menu,
  MenuHeader,
  MenuItem,
  MenuSeparator,
  PageHeading,
  Panel,
  Price,
  Rating,
  SectionHeader,
  Select,
  Stat,
  StatStrip,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  Textarea,
  useToast,
  type ButtonVariant,
  type ChipGroupVariant,
  type TagTone,
} from "@/components/ui";

const COLORS = [
  { group: "Surfaces", tokens: ["bg", "panel", "field", "raised"] },
  { group: "Lines", tokens: ["border", "border-strong", "faint"] },
  { group: "Text", tokens: ["white", "text", "dim", "muted"] },
  { group: "Accent", tokens: ["teal", "teal-hover", "teal-deep", "teal-ink"] },
  { group: "Semantic", tokens: ["rose", "rose-soft", "deal", "amber", "sky"] },
];

const TYPE_SCALE = [
  { cls: "text-hero", px: 60, use: "Discover hero title" },
  { cls: "text-display", px: 52, use: "Game title" },
  { cls: "text-page", px: 40, use: "Page title" },
  { cls: "text-section", px: 22, use: "Section heading" },
  { cls: "text-lead", px: 17, use: "Lead paragraph" },
  { cls: "text-body", px: 15, use: "Card titles, body copy" },
  { cls: "text-sm", px: 14, use: "Default UI text" },
  { cls: "text-ui", px: 13, use: "Metadata, small controls" },
  { cls: "text-label", px: 12, use: "Captions, notes" },
  { cls: "text-micro", px: 11, use: "Mono caps labels" },
];

const ICONS: IconName[] = [
  "search", "heart", "heart-filled", "library", "grid", "list", "clock", "play", "pause",
  "close", "chevron-left", "chevron-right", "chevron-down", "chevron-up", "arrow-up",
  "external", "calendar-add", "send", "check", "plus", "comment", "reply", "spoiler",
  "edit", "trash", "thumbs-up", "sparkles", "expand", "trend-down", "trend-up",
];

const BUTTON_VARIANTS: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "danger", "live", "light"];
const TAG_TONES: TagTone[] = ["neutral", "teal", "rose", "amber", "deal"];
const CHIP_VARIANTS: ChipGroupVariant[] = ["pill", "segmented", "underline"];

const OPTIONS = [
  { value: "rating", label: "Rating" },
  { value: "popularity", label: "Popularity" },
  { value: "date", label: "Newest" },
];

/// Living style guide: every token and component state, rendered from the
/// same components the app uses, so it can never drift from production.
export default function DesignSystemPage() {
  return (
    <PageContainer className="gap-14">
      <PageHeading
        title="Design system"
        description="Overdrive tokens and components, rendered live from production code."
      />
      <p className="-mt-8 max-w-[680px] text-body leading-relaxed text-ov-dim">
        Values come from the theme tokens in <code className="font-mono text-ov-teal">globals.css</code>; every
        component below is the one the app ships. Interactive primitives (tabs, select, menu, dialog, toggle
        groups, checkbox, switch, toast) are built on Radix for keyboard and screen-reader behaviour.
      </p>

      <Section index="01" title="Color">
        <ColorTokens />
      </Section>

      <Section index="02" title="Type">
        <div className="divide-y divide-ov-border border-y border-ov-border">
          {TYPE_SCALE.map((t) => (
            <div key={t.cls} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-3">
              <code className="w-28 shrink-0 font-mono text-label text-ov-teal">{t.cls}</code>
              <span className="w-12 shrink-0 font-mono text-label text-ov-muted">{t.px}px</span>
              <span className={`${t.cls} min-w-0 flex-1 truncate font-semibold text-ov-white`}>{t.use}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Panel className="flex flex-col gap-2 p-5">
            <Eyebrow>UI · GEIST</Eyebrow>
            <span className="text-xl font-semibold">Every game, every price drop.</span>
          </Panel>
          <Panel className="flex flex-col gap-2 p-5">
            <Eyebrow>LABELS · GEIST MONO</Eyebrow>
            <span className="font-hud text-base">PRICE HISTORY · 24H</span>
          </Panel>
          <Panel className="flex flex-col gap-2 p-5">
            <Eyebrow>NUMERALS · ORBITRON</Eyebrow>
            <span className="font-orbitron text-[28px] font-bold">₹2,799 · 96</span>
          </Panel>
        </div>
      </Section>

      <Section index="03" title="Chamfer">
        <div className="flex flex-wrap gap-6">
          {(["sm", "md"] as const).map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <div
                className={`ov-chamfer ${size === "sm" ? "ov-chamfer-sm" : ""} size-24 border border-ov-teal-deep bg-ov-teal/8`}
              />
              <code className="font-mono text-label text-ov-dim">{size === "sm" ? "sm · 8px controls" : "md · 16px cards"}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section index="04" title="Buttons">
        <div className="flex flex-col gap-4">
          {BUTTON_VARIANTS.map((variant) => (
            <Row key={variant} label={variant}>
              <Button variant={variant} size="sm">Small</Button>
              <Button variant={variant} icon="play">Medium</Button>
              <Button variant={variant} size="lg" iconRight="external">Large</Button>
              <Button variant={variant} loading>Loading</Button>
              <Button variant={variant} disabled>Disabled</Button>
            </Row>
          ))}
          <Row label="pressed">
            <PressedDemo />
          </Row>
          <Row label="icon">
            <IconButton icon="close" label="Ghost" />
            <IconButton icon="chevron-left" label="Outline" variant="outline" iconClassName="text-lg" />
            <span className="flex gap-2 bg-ov-raised p-3">
              <IconButton icon="heart" label="Overlay" variant="overlay" />
              <IconButton icon="heart-filled" label="Overlay, pressed" variant="overlay" aria-pressed />
            </span>
          </Row>
        </div>
      </Section>

      <Section index="05" title="Tags and verdicts">
        <Row label="tags">
          {TAG_TONES.map((tone) => (
            <Tag key={tone} tone={tone}>
              {tone === "deal" ? "-30%" : tone}
            </Tag>
          ))}
        </Row>
        <Row label="verdicts">
          {VERDICTS.map((v) => (
            <VerdictBadge key={v.value} verdict={v.value} />
          ))}
        </Row>
        <Row label="ratings">
          <Rating value={96} boxed />
          <Rating value={72} boxed />
          <Rating value={null} boxed />
        </Row>
      </Section>

      <Section index="06" title="Selection">
        <SelectionDemos />
      </Section>

      <Section index="07" title="Tabs">
        <Tabs defaultValue="overview">
          <TabsList className="border-b border-ov-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews <span className="bg-ov-raised px-1.5 font-hud text-label text-ov-dim">551</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-4 text-sm text-ov-text">
            Arrow keys move between tabs; each panel is labelled by its tab.
          </TabsContent>
          <TabsContent value="reviews" className="pt-4 text-sm text-ov-text">
            Reviews panel.
          </TabsContent>
        </Tabs>
      </Section>

      <Section index="08" title="Fields">
        <FieldDemos />
      </Section>

      <Section index="09" title="Overlays">
        <OverlayDemos />
      </Section>

      <Section index="10" title="Data">
        <StatStrip>
          <Stat label="CRITIC">
            <span className="text-ov-teal">96</span>
          </Stat>
          <Stat label="PS STORE" hint="Lowest in 30 days">
            ₹2,799
          </Stat>
          <Stat label="HYPE" hint="hypes on IGDB">
            309
          </Stat>
        </StatStrip>
        <Row label="price">
          <Price current="₹2,799" original="₹3,999" />
          <Price size="xl" current="₹2,799" original="₹3,999" />
        </Row>
      </Section>

      <Section index="11" title="Icons">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
          {ICONS.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2 border border-ov-border px-2 py-3">
              <OvIcon name={name} className="text-lg text-ov-text" />
              <code className="font-mono text-micro text-ov-muted">{name}</code>
            </div>
          ))}
        </div>
      </Section>
    </PageContainer>
  );
}

function Section({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5" aria-label={title}>
      <SectionHeader index={index} title={title} />
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="w-24 shrink-0 font-mono text-label text-ov-muted">{label}</code>
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
      for (const token of tokens) next[token] = styles.getPropertyValue(`--color-ov-${token}`).trim();
    }
    setValues(next);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {COLORS.map(({ group, tokens }) => (
        <div key={group} className="flex flex-col gap-2">
          <Eyebrow>{group}</Eyebrow>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
            {tokens.map((token) => (
              <div key={token} className="border border-ov-border">
                <div className="h-14" style={{ background: `var(--color-ov-${token})` }} />
                <div className="flex flex-col px-3 py-2">
                  <span className="text-ui text-ov-white">ov-{token}</span>
                  <code className="font-mono text-micro text-ov-muted">{values[token] || "…"}</code>
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
  const [wished, setWished] = useState(true);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Button
        size="lg"
        variant={wished ? "danger" : "secondary"}
        icon={wished ? "heart-filled" : "heart"}
        aria-pressed={wished}
        onClick={() => setWished((v) => !v)}
      >
        {wished ? "Wishlisted" : "Wishlist"}
      </Button>
      <Button
        size="lg"
        variant="secondary"
        icon={saved ? "check" : undefined}
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
      >
        {saved ? "Playing" : "Add to library"}
      </Button>
    </>
  );
}

function SelectionDemos() {
  const [values, setValues] = useState<Record<string, string>>({ pill: "rating", segmented: "rating", underline: "rating" });
  const [listValue, setListValue] = useState("rpg");
  const [select, setSelect] = useState("rating");
  const [hide, setHide] = useState(true);
  const [spoilers, setSpoilers] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {CHIP_VARIANTS.map((variant) => (
        <Row key={variant} label={variant}>
          <ChipGroup
            label={`${variant} example`}
            variant={variant}
            options={OPTIONS}
            value={values[variant]}
            onValueChange={(v) => setValues((prev) => ({ ...prev, [variant]: v }))}
          />
        </Row>
      ))}
      <Row label="list">
        <ChipGroup
          label="Genre example"
          variant="list"
          className="w-56"
          options={[
            { value: "all", label: "All genres" },
            { value: "rpg", label: "RPG" },
            { value: "indie", label: "Indie" },
          ]}
          value={listValue}
          onValueChange={setListValue}
        />
      </Row>
      <Row label="select">
        <Select label="Sort by" options={OPTIONS} value={select} onValueChange={setSelect} />
      </Row>
      <Row label="toggles">
        <Checkbox checked={hide} onCheckedChange={setHide}>
          Hide spoilers
        </Checkbox>
        <Switch checked={spoilers} onCheckedChange={setSpoilers}>
          Contains spoilers
        </Switch>
      </Row>
    </div>
  );
}

function FieldDemos() {
  const [text, setText] = useState("");
  return (
    <div className="grid max-w-[720px] gap-6 md:grid-cols-2">
      <div>
        <FieldLabel htmlFor="demo-email">Email</FieldLabel>
        <Input id="demo-email" placeholder="you@example.com" />
      </div>
      <div>
        <FieldLabel htmlFor="demo-invalid">Invalid</FieldLabel>
        <Input id="demo-invalid" defaultValue="not-an-email" invalid />
      </div>
      <div className="md:col-span-2">
        <div className="mb-1.5 flex items-baseline">
          <FieldLabel htmlFor="demo-body" className="mb-0">
            Review
          </FieldLabel>
          <CharCount count={text.length} max={40} className="ml-auto" />
        </div>
        <Textarea
          id="demo-body"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          invalid={text.length > 40}
          placeholder="Type past 40 characters to see the invalid state…"
        />
      </div>
    </div>
  );
}

function OverlayDemos() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <Row label="triggers">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Menu
        align="start"
        trigger={
          <Button variant="outline" iconRight="chevron-down">
            Open menu
          </Button>
        }
      >
        <MenuHeader>
          <div className="text-body font-semibold">neon_drifter</div>
          <div className="text-ui text-ov-muted">you@example.com</div>
        </MenuHeader>
        <MenuItem>Wishlist</MenuItem>
        <MenuItem>Library</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger">Sign out</MenuItem>
      </Menu>
      <Button
        variant="outline"
        onClick={() => toast({ message: "Added to wishlist", action: { label: "Undo", onClick: () => {} } })}
      >
        Show toast
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        eyebrow="DIALOG"
        title="Focus is trapped in here"
        description="Example dialog from the design system page"
        className="max-w-[480px]"
      >
        <p className="px-6 pb-6 text-sm leading-relaxed text-ov-text">
          Tab cycles within the dialog, Escape or a click outside closes it, and focus returns to the button
          that opened it.
        </p>
      </Dialog>
    </Row>
  );
}
