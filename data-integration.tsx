// Example: Save Basiq data to your existing database
const saveBasiqData = async (userId: string, accounts: any[]) => {
  await fetch("/api/your-existing-endpoint", {
    method: "POST",
    body: JSON.stringify({ userId, accounts }),
  })
}
