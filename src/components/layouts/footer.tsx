export function Footer() {
  return (
    <footer className="border-t bg-background/50 px-4 py-3 text-center text-xs text-muted-foreground sm:px-6 mb-16 md:mb-0">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>© {new Date().getFullYear()} SISFO SD Islam Al-Azhar Cairo Palembang v2.0</p>
        <p className="font-medium text-emerald-800 dark:text-emerald-400">
          Developed By Team IT SD Al Azhar Cairo Palembang
        </p>
      </div>
    </footer>
  );
}
