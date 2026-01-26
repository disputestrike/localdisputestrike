# Experian Master Letter Template (Reference)

**Source:** User-provided Experian dispute letter (Dec 29, 2025). Use as canonical structure for dispute letter generation. Mirror for TransUnion and Equifax.

---

## 30-Day Rule (FCRA Alignment)

**Legal requirement:** FCRA § 1681i(a)(3)(A) — bureaus have **30 days** to investigate. All "demand" / "respond within" language must use **30 days**, not 15.

- Overall timeline (Section VI, FINAL NOTICE): **30 days** ✅  
- Per-account DEMANDs: In the original letter, Account 1 (ProCollect) used "within 15 days" and "Failure to provide... within 15 days." **Our implementation uses 30-day demands only.**

---

## Letter Structure

1. **Header**
   - Consumer: name, address, date  
   - Bureau: Experian P.O. Box 4500, Allen, TX 75013  
   - **SENT VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED**  
   - **Re:** FORMAL DISPUTE OF INACCURATE AND UNVERIFIABLE TRADELINES — [FIRST/SECOND] DISPUTE  
   - **IMPORTANT: ADDRESS AND NAME CORRECTION REQUIRED**  
   - Consumer: Name | DOB | SSN (masked, e.g. XXX-XX-7656)

2. **IMPORTANT NOTICE - ADDRESS AND NAME VERIFICATION**
   - Correct name (only, no variations)  
   - Correct addresses (current + previous); "Do NOT report any other addresses"  
   - Exhibits: **A** = ID (passport/driver’s license), **B** = Utility bill (address verification)

3. **I. LEGAL BASIS**
   - FCRA § 1681i(a)(1)(A) — dispute accuracy/completeness  
   - § 1681i(a)(5)(A) — delete unverifiable information  
   - § 1681i(a)(3)(A) — **30-day** reasonable reinvestigation  
   - If second dispute: "inadequate investigation," "conflicting data remains"

4. **II. CRITICAL PROBLEM: CROSS-BUREAU CONFLICTS**
   - Materially different info across Experian vs Equifax vs TransUnion  
   - § 1681i(a)(5)(A) "maximum possible accuracy"  
   - § 1681s-2(a)(1)(A) — furnishers cannot report info they know or have reason to believe is inaccurate

5. **III. ACCOUNT-BY-ACCOUNT DISPUTES**
   - For each account:
     - **Account info you report:** number (masked), creditor, balance, status, dates, comments  
     - **What other bureaus report:** TU / EQ breakdown  
     - **VIOLATIONS IDENTIFIED:** numbered (timeline errors, status conflicts, balance conflicts, duplicate reporting, etc.)  
     - **LEGAL REQUIREMENT FOR DELETION** (cite § 1681i(a)(5)(A))  
     - **DEMAND:** Delete [or correct] — **use 30-day deadline** for verification/deletion demands

6. **IV. ACCOUNTS THAT SHOULD NOT REPORT NEGATIVELY**
   - Paid/closed, 100% on-time accounts; request **CORRECT STATUS** to positive closure

7. **V. SUMMARY OF DEMANDS**
   - Table: Account | Demand (DELETE/CORRECT/DELETE DUPLICATES) | Basis

8. **VI. LEGAL REQUIREMENTS & TIMELINE**
   - **30 days** from receipt: reinvestigate, review enclosures, contact furnishers, correct/delete, provide written notice  
   - § 1681i(a)(3)(A), (a)(5)(A)

9. **VII. SUPPORTING DOCUMENTATION ENCLOSED**
   - Exhibit A: ID | B: Utility | C–E: Credit reports (EX, EQ, TU) | F+: other (e.g. surrender docs)

10. **VIII. CONSEQUENCES OF NON-COMPLIANCE**
    - §§ 1681s-2(b), 1681i(a)(5)(A), 1681n, 1681o; CFPB, FTC, AG, litigation

11. **IX. REQUIRED RESPONSE**
    - Confirm deletions/corrections, procedures used, furnisher contact, documentation reviewed

12. **CONTACT INFORMATION**
    - Consumer address for all future correspondence

13. **FINAL NOTICE**
    - "Written confirmation of deletion and/or correction **within 30 days** of receipt"  
    - CFPB/litigation if inadequate response

14. **ENCLOSURES**  
    - Checklist: Exhibit A, B, C, …

---

## Violation Types (from sample)

- Impossible timeline (e.g. activity before account opened)  
- Last activity date conflicts across bureaus  
- Status conflicts (e.g. Charge-off vs Open)  
- Balance discrepancies across bureaus  
- Open date conflicts  
- Payment history conflicts  
- Unverifiable balance (no payment history)  
- Duplicate reporting (same debt, multiple instances)  
- Account number conflicts across bureaus  
- Re-aging (§ 1681s-2(a)(5))  
- Previously disputed, inadequate investigation  

---

## TransUnion / Equifax

Use the same structure. Update bureau name, address, and "What **other** bureaus report" so that each letter targets the correct bureau and cites the other two for cross-bureau conflicts.
