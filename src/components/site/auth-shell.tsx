import { Waveform } from "../visuals";

export function AuthShell({ title, lead, children, aside }: { title: string; lead?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1440px] lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <div className="gridlines relative hidden overflow-hidden border-r border-line lg:block">
        <Waveform seed={77} bars={110} height={200} className="absolute inset-x-10 top-1/3 h-48 text-ivory/25" />
        <p className="absolute bottom-10 left-10 font-display text-6xl font-bold uppercase leading-[0.9] tracking-[-0.04em]">
          Learn.<br />Connect.<br /><span className="text-lime">Perform.</span>
        </p>
      </div>
      <div className="flex flex-col justify-center px-5 py-12 md:px-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-[-0.03em]">{title}</h1>
          {lead && <p className="mt-3 text-stone">{lead}</p>}
          <div className="mt-8">{children}</div>
          {aside && <div className="mt-6">{aside}</div>}
        </div>
      </div>
    </div>
  );
}
