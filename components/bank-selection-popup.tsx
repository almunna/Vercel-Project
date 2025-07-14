"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, CreditCard, Landmark, Banknote } from "lucide-react"

interface BankSelectionPopupProps {
  isOpen: boolean
  onClose: () => void
  onBankSelect: (bank: string) => void
}

const banks = [
  {
    id: "westpac",
    name: "Westpac",
    description: "Westpac Banking Corporation",
    icon: Building2,
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: "anz",
    name: "ANZ",
    description: "Australia and New Zealand Banking Group",
    icon: Landmark,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "cba",
    name: "CBA",
    description: "Commonwealth Bank of Australia",
    icon: Banknote,
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: "amex",
    name: "Amex",
    description: "American Express",
    icon: CreditCard,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600",
  },
]

export function BankSelectionPopup({ isOpen, onClose, onBankSelect }: BankSelectionPopupProps) {
  const handleBankSelect = (bankId: string) => {
    onBankSelect(bankId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Bank</DialogTitle>
          <DialogDescription>Choose your bank to use the appropriate PDF parser for your statement.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {banks.map((bank) => {
            const IconComponent = bank.icon
            return (
              <Card
                key={bank.id}
                className={`cursor-pointer transition-all duration-200 ${bank.color}`}
                onClick={() => handleBankSelect(bank.id)}
              >
                <CardContent className="p-4 text-center">
                  <IconComponent className={`h-8 w-8 mx-auto mb-2 ${bank.iconColor}`} />
                  <h3 className="font-semibold text-sm">{bank.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{bank.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
