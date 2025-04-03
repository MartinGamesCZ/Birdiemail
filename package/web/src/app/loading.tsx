export default function Loading() {
  const messages = [
    "Loading your emails...",
    "Assembling nuclear reactor...",
    "Summoning the email gods...",
    "Fetching your messages...",
    "Loading your inbox...",
    "Preparing the email magic...",
    "Gathering your messages...",
    "Email is a... mess",
    "Convincing spam to identify itself...",
    "Untangling reply-all nightmares...",
    "Counting unread emails you'll never open...",
    "Brewing coffee for the server hamsters...",
    "Teaching AI to understand your passive-aggressive tone...",
    "Decoding cryptic subject lines...",
    "Hiding evidence of your 3 AM shopping spree...",
    "Separating important emails from 'special offers'...",
    "Calculating excuses for late replies...",
    "Locating emails lost in the void since 2019...",
    "Translating corporate speak to human language...",
    "Organizing inbox chaos into slightly less chaos...",
    "Huh? Email client loading tips?!",
    "Crunching up some real spicy data...",
    "Launching a rocket...",
    "Reordering your messy windows...",
    "Preparing for a flight...",
    "Waiting for IMAP to connect (almost there)...",
    "Retrieving your lost mail...",
    "Resolving addresses...",
    "Who is Lucy?",
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
      </div>

      <div className="mt-8 space-y-4 w-full max-w-md">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>

        <div className="h-24 bg-gray-100 rounded animate-pulse mt-6"></div>
      </div>

      <p className="mt-6 text-gray-500 animate-pulse">{message}</p>
    </div>
  );
}
