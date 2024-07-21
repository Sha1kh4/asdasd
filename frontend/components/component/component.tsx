"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

// Assume we have a userId stored somewhere (e.g., in a global state or context)
const userId = 1;

export function Component() {
    const [balance, setBalance] = useState({ tokens: 0, loyalty_points: 0 });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchBalance();
        fetchTransactions();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await fetch(`http://localhost:4000/users/${userId}/balance`);
            console.log(response) // response is not coming
            const data = await response.json();
            setBalance(data);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`http://localhost:4000/users/${userId}/transactions`);
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const issueTokens = async (amount) => {
        try {
            const response = await fetch(`/api/users/${userId}/issue-tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            await response.json();
            fetchBalance();
            fetchTransactions();
        } catch (error) {
            console.error('Error issuing tokens:', error);
        }
    };

    const redeemTokens = async (amount) => {
        try {
            const response = await fetch(`/api/users/${userId}/redeem-tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            await response.json();
            fetchBalance();
            fetchTransactions();
        } catch (error) {
            console.error('Error redeeming tokens:', error);
        }
    };

    const addLoyaltyPoints = async (points) => {
        try {
            const response = await fetch(`/api/users/${userId}/add-loyalty-points`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ points }),
            });
            await response.json();
            fetchBalance();
        } catch (error) {
            console.error('Error adding loyalty points:', error);
        }
    };

    console.log(balance)

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <main className="flex flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                        <Card className="bg-card text-card-foreground">
                            <CardHeader className="pb-3">
                                <CardTitle>Your Token Balance</CardTitle>
                                <CardDescription>Your current token balance for redeeming rewards.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">{balance.tokens}</div>
                                <div className="text-sm text-muted-foreground">Tokens</div>
                                <div className="mt-2">
                                    <div className="text-lg font-semibold">{balance.loyalty_points}</div>
                                    <div className="text-sm text-muted-foreground">Loyalty Points</div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => redeemTokens(100)}>Redeem 100 Tokens</Button>
                            </CardFooter>
                        </Card>
                        <Card className="bg-card text-card-foreground">
                            <CardHeader className="pb-3">
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>View your recent token transactions and activity.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((tx, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                                                <TableCell>{tx.type}</TableCell>
                                                <TableCell className="text-right">{tx.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="bg-card text-card-foreground">
                        <CardHeader className="pb-3">
                            <CardTitle>Available Rewards</CardTitle>
                            <CardDescription>Redeem your tokens for exclusive rewards and benefits.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reward</TableHead>
                                        <TableHead className="text-right">Token Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium">Free Shipping</div>
                                            <div className="text-sm text-muted-foreground">Free shipping on your next order</div>
                                        </TableCell>
                                        <TableCell className="text-right">250</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium">Exclusive T-Shirt</div>
                                            <div className="text-sm text-muted-foreground">Limited edition loyalty t-shirt</div>
                                        </TableCell>
                                        <TableCell className="text-right">500</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium">VIP Event Invite</div>
                                            <div className="text-sm text-muted-foreground">Invitation to our annual VIP event</div>
                                        </TableCell>
                                        <TableCell className="text-right">1000</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <div className="font-medium">Discount Coupon</div>
                                            <div className="text-sm text-muted-foreground">20% off your next purchase</div>
                                        </TableCell>
                                        <TableCell className="text-right">100</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card className="bg-card text-card-foreground">
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/50 px-6 py-4">
                            <div className="grid gap-0.5">
                                <CardTitle className="text-lg font-medium">Rewards Program</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Exclusive benefits for loyal customers
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                                        <MoveHorizontalIcon className="h-4 w-4" />
                                        <span className="sr-only">More</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>How it Works</DropdownMenuItem>
                                    <DropdownMenuItem>Terms &amp; Conditions</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Contact Support</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-6 text-sm">
                            <div className="grid gap-3">
                                <div className="font-semibold">Exclusive Rewards</div>
                                <ul className="grid gap-3">
                                    <li className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GiftIcon className="h-5 w-5 text-muted-foreground" />
                                            <span>Free Shipping</span>
                                        </div>
                                        <span className="font-medium">250 Tokens</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShirtIcon className="h-5 w-5 text-muted-foreground" />
                                            <span>Exclusive T-Shirt</span>
                                        </div>
                                        <span className="font-medium">500 Tokens</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                            <span>VIP Event Invite</span>
                                        </div>
                                        <span className="font-medium">1000 Tokens</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <PercentIcon className="h-5 w-5 text-muted-foreground" />
                                            <span>Discount Coupon</span>
                                        </div>
                                        <span className="font-medium">100 Tokens</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
 function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}


function GiftIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}


function MoveHorizontalIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
    </svg>
  )
}


function PercentIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}


function ShirtIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
