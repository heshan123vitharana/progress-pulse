"use client";

import { useState, useEffect } from "react";

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string; // To accept className from parent for layout if needed
}

const COUNTRY_CODES = [
    { code: "+94", country: "Sri Lanka" },
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+61", country: "Australia" },
    { code: "+86", country: "China" },
    { code: "+81", country: "Japan" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+971", country: "UAE" },
    { code: "+65", country: "Singapore" },
];

export default function PhoneInput({ value, onChange, className = "" }: PhoneInputProps) {
    const [countryCode, setCountryCode] = useState("+94");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Initialize/Update local state from prop value
    useEffect(() => {
        if (!value) {
            setCountryCode("+94");
            setPhoneNumber("");
            return;
        }

        // Try to match existing code
        const matchedCode = COUNTRY_CODES.find(c => value.startsWith(c.code));
        if (matchedCode) {
            setCountryCode(matchedCode.code);
            setPhoneNumber(value.replace(matchedCode.code, "").trim());
        } else {
            // If no match found (or manually entered different code), keep default or try best guess?
            // Fallback: If starts with +, assume user might have manual code, but here we enforce dropdown.
            // If it behaves weirdly, we might just show it all in number if we can't parse, 
            // but design says "dropdown". let's stick to parsing known codes.
            // If unknown code, maybe just treat entire thing as number? 
            // Better: just strip the known code if present, otherwise assume it's just a number
            // or the code is missing.
            setPhoneNumber(value.trim());
        }
    }, [value]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        setCountryCode(newCode);
        onChange(`${newCode} ${phoneNumber}`);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNumber = e.target.value;
        setPhoneNumber(newNumber);
        onChange(`${countryCode} ${newNumber}`);
    };

    return (
        <div className={`flex ${className}`}>
            <select
                value={countryCode}
                onChange={handleCodeChange}
                className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-700 sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[100px]"
            >
                {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                        {c.code} ({c.country})
                    </option>
                ))}
            </select>
            <input
                type="text"
                value={phoneNumber}
                onChange={handleNumberChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="771234567"
            />
        </div>
    );
}
