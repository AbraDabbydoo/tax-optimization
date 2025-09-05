# Project Roadmap

This roadmap outlines the planned phases and workstreams for the Tax Optimization platform. It is designed to be flexible; items may be re-prioritized based on user feedback and resources.

## Phase 1: Foundation & Data (Weeks 1-4)

- [ ] Design update mechanism for annual tax changes

### 2. State Tax Data Completion

- [x] Research and document income tax brackets for all 50 states + DC
- [x] Add filing status variations for each state
- [ ] Document standard deductions by state and filing status (No. The data files include standardDeduction, but the calculator doesn’t subtract it anywhere. Income tax is computed on adjustedIncome without applying a state filing-status standard deduction. Want me to wire it in next?)
- [x] Research and add personal exemptions by state (Illinois completed - see Missing Tax Status Inputs section for blind exemption notes)
- [x] Document property tax rates and assessment methods by state
- [x] Research sales tax rates (state and average local) for all states
- [x] Add special tax treatments (retirement, investment income, etc.)
- [ ] Document state-specific tax credits and deductions
- [x] Loading screen before results

### 3. Lifestyle & Regional Data

- [x] Complete lifestyle tags for all states
- [ ] Add climate data (temperature ranges, precipitation, etc.)
- [ ] Include cost of living data by city/region within states
- [ ] Add home insurance rates per state
- [ ] Add natural disaster rating per state
- [ ] Add quality of life metrics (healthcare access, education, etc.)
- [ ] Create regional economic data (job markets, industries, etc.)

## Phase 2: Core Calculation Engine (Weeks 5-8)

### 4. Tax Calculation Refinement

- [ ] Implement standard deductions by filing status
- [ ] Add personal exemptions based on dependents
- [ ] Incorporate state-specific tax credits
- [ ] Implement phase-outs for deductions and credits
- [ ] Add AMT (Alternative Minimum Tax) calculations where applicable
- [x] Create more sophisticated property tax estimations
- [x] Refine sales tax calculations based on spending patterns
- [N/a] Add local income tax calculations for applicable jurisdictions

### 5. Advanced Scenarios

- [N/A] Implement multi-state income calculations N/A
- [N/A] Add part-year resident tax calculations N/A
- [ ] Create retirement income specialized calculations
- [ ] Implement investment income tax treatments N/A
- [ ] Add business income pass-through calculations N/A
- [ ] Create real estate investor specialized calculations N/A
- [ ] Implement high-net-worth specialized scenarios N/A

### 6. Testing & Validation

- [ ] Create test cases for each state's tax calculations
- [ ] Develop comparison tests against official tax calculators
- [ ] Implement edge case testing
- [ ] Create regression testing for calculation accuracy
- [ ] Develop performance testing for calculation engine
- [ ] Create documentation for all calculation methodologies

## Phase 3: User Experience Enhancement (Weeks 9-12)

### 7. User Interface Improvements

- [ ] Redesign multi-step form with progress indicators
- [ ] Create responsive layouts for all device sizes
- [ ] Implement real-time validation and feedback
- [ ] Add tooltips and help text for complex tax concepts
- [ ] Create a "quick estimate" mode for faster results
- [ ] Implement save/resume functionality for form completion
- [ ] Add print-friendly layouts for results

### 8. Results Visualization

- [ ] Create interactive tax breakdown charts
- [ ] Implement state comparison visualizations
- [ ] Add map-based results visualization
- [ ] Create lifestyle factor comparison tools
- [ ] Implement cost of living adjustment visualizations
- [ ] Add historical tax trend visualizations
- [ ] Create "what-if" scenario comparison tools

### 9. Content & Education

- [ ] Develop explanatory content for tax concepts
- [ ] Create state-specific tax guides
- [ ] Add tooltips and contextual help throughout the application
- [ ] Develop a tax optimization knowledge base
- [ ] Create FAQ section with common questions
- [ ] Add case studies and example scenarios
- [ ] Develop video tutorials for using the platform

## Phase 4: User Accounts & Data Management (Weeks 13-16)

### 10. User Authentication

- [ ] Implement secure user registration and login
- [ ] Add social login options (Google, Apple, etc.)
- [ ] Create password reset and account recovery
- [ ] Implement email verification
- [ ] Add two-factor authentication
- [ ] Create user profile management
- [ ] Implement session management and security

### 11. Data Persistence

- [ ] Design database schema for user data
- [ ] Implement saving and loading of tax scenarios
- [ ] Create data export functionality (CSV, PDF)
- [ ] Add scenario comparison for saved calculations
- [ ] Implement data backup and recovery
- [ ] Create data retention policies
- [ ] Add GDPR/CCPA compliance features

### 12. Collaboration Features

- [ ] Implement scenario sharing between users
- [ ] Add commenting and notes on tax scenarios
- [ ] Create CPA collaboration tools
- [ ] Implement document upload for tax documents
- [ ] Add secure messaging system
- [ ] Create multi-user household accounts
- [ ] Implement activity logging and history

## Phase 5: Professional Features (Weeks 17-20)

### 13. Report Generation

- [ ] Design professional PDF report templates
- [ ] Implement detailed tax breakdown reports
- [ ] Create comparative analysis reports
- [ ] Add executive summary reports
- [ ] Implement custom branding for reports
- [ ] Create scheduled report generation
- [ ] Add report sharing and export options

### 14. CPA Integration

- [ ] Implement CPA booking system
- [ ] Create CPA dashboard for client management
- [ ] Add video consultation integration
- [ ] Implement document sharing for CPAs
- [ ] Create CPA recommendation engine
- [ ] Add CPA review and rating system
- [ ] Implement CPA specialization matching

### 15. API & Integrations

- [ ] Design and document public API
- [ ] Create integration with tax preparation software
- [ ] Add financial planning tool integrations
- [ ] Implement real estate listing integrations
- [ ] Create cost of living data integrations
- [ ] Add job market data integrations
- [ ] Implement climate data integrations

## Phase 6: Monetization & Business Features (Weeks 21-24)

### 16. Payment Processing

- [ ] Implement secure payment gateway
- [ ] Create subscription management
- [ ] Add one-time purchase options
- [ ] Implement coupon and discount system
- [ ] Create invoicing and receipts
- [ ] Add refund processing
- [ ] Implement tax reporting for payments

### 17. Tiered Service Levels

- [ ] Design feature tiers (free, basic, premium)
- [ ] Implement access control by subscription level
- [ ] Create upgrade/downgrade flows
- [ ] Add enterprise/team licensing options
- [ ] Implement usage limits by tier
- [ ] Create conversion funnels for upgrades
- [ ] Add promotional trial periods

### 18. Admin Dashboard

- [ ] Create user management interface
- [ ] Implement analytics dashboard
- [ ] Add content management system
- [ ] Create tax data management tools
- [ ] Implement system monitoring
- [ ] Add revenue reporting
- [ ] Create customer support tools

## Phase 7: Marketing & Growth (Weeks 25-28)

### 19. SEO & Content Marketing

- [ ] Implement SEO best practices
- [ ] Create landing pages for specific tax scenarios
- [ ] Add state-specific landing pages
- [ ] Implement blog with tax optimization content
- [ ] Create downloadable tax guides
- [ ] Add testimonials and case studies
- [ ] Implement structured data for search engines

### 20. Referral & Affiliate System

- [ ] Create referral program for users
- [ ] Implement affiliate tracking
- [ ] Add commission management
- [ ] Create affiliate dashboard
- [ ] Implement promotional materials
- [ ] Add conversion tracking
- [ ] Create payout system

### 21. Analytics & Optimization

- [ ] Implement comprehensive analytics
- [ ] Create conversion funnels
- [ ] Add A/B testing framework
- [ ] Implement user feedback collection
- [ ] Create user behavior analysis
- [ ] Add performance monitoring
- [ ] Implement continuous improvement process

## Phase 8: Scaling & Advanced Features (Weeks 29-32)

### 22. Performance Optimization

- [ ] Implement caching strategies
- [ ] Create database optimization
- [ ] Add load balancing
- [ ] Implement CDN for static assets
- [ ] Create automated scaling
- [ ] Add performance monitoring
- [ ] Implement batch processing for reports

### 23. Mobile Applications

- [ ] Design mobile app wireframes
- [ ] Create React Native mobile application
- [ ] Implement offline functionality
- [ ] Add push notifications
- [ ] Create mobile-specific features
- [ ] Implement app store optimization
- [ ] Add deep linking with web application

### 24. Advanced AI Features

- [ ] Implement personalized recommendations
- [ ] Create natural language query system
- [ ] Add predictive tax planning
- [ ] Implement anomaly detection
- [ ] Create automated tax optimization suggestions
- [ ] Add life event tax impact predictions
- [ ] Implement AI-powered tax assistant

## Ongoing Maintenance & Updates

### 25. Annual Tax Updates

- [ ] Create process for annual tax law changes
- [ ] Implement bracket and rate updates
- [ ] Add new tax credits and deductions
- [ ] Update standard deductions and exemptions
- [ ] Create change documentation
- [ ] Implement version control for tax data
- [ ] Add historical comparison features

### 26. Security & Compliance

- [ ] Conduct regular security audits
- [ ] Implement vulnerability scanning
- [ ] Add compliance monitoring
- [ ] Create security incident response plan
- [ ] Implement data privacy enhancements
- [ ] Add regulatory compliance updates
- [ ] Create security documentation

### 27. Customer Support

- [ ] Implement help desk system
- [ ] Create knowledge base
- [ ] Add live chat support
- [ ] Implement ticket tracking
- [ ] Create customer satisfaction monitoring
- [ ] Add support performance metrics
- [ ] Implement user training materials

## Resource Planning

### Development Resources

- [ ] Frontend developer(s): UI/UX implementation
- [ ] Backend developer(s): Calculation engine, API, data management
- [ ] Data analyst: Tax research and data validation
- [ ] Designer: UI/UX design, report templates, visualizations
- [ ] QA tester: Validation of calculations and user flows

### External Resources

- [ ] Tax professional consultant(s) for validation
- [ ] Legal counsel for compliance review
- [ ] Security auditor for vulnerability assessment
- [ ] Marketing specialist for growth strategies

## Timeline Flexibility

This roadmap is designed to be flexible. You can:

- [ ] Prioritize certain phases based on user feedback
- [ ] Adjust the timeline based on available resources
- [ ] Release incremental versions as features are completed
- [ ] Focus on core functionality first and expand later

## calculateandstoreagi (AGI Calculation Utility)

The AGI calculation utility (see [lib/utils.ts](lib/utils.ts)) currently does not collect the following IRS "above-the-line" adjustments or income inputs. These should be added to the user input flow in future updates:

### Missing AGI Inputs/Adjustments
- [x] Educator expenses
- [x] Moving expenses for military
- [x] Self-employment tax deduction (50%)
- [x] Self-employed health insurance deduction
- [x]Penalty on early withdrawal of savings
- [x] Student loan interest deduction
- [x] Tuition and fees deduction
- Other less common adjustments (e.g., jury duty pay given to employer)

**Note:**
- These fields are set to `0` in the AGI calculation until user input is collected.
- See the implementation in [lib/utils.ts](lib/utils.ts) for details and update points.

## **Annual Tax Update System Design**

### **1. Core Update Framework**

**Create a new `tax-update-system/` directory** with the following structure:

```
tax-update-system/
├── config/
│   ├── tax-year-config.json       # Current tax year settings
│   └── update-schedule.json       # Annual update timeline
├── sources/
│   ├── official/                  # IRS and state government sources
│   └── third-party/               # Additional data sources
├── processors/
│   ├── federal-processor.js       # Federal tax updates
│   ├── state-processor.js         # State tax updates
│   └── validation-processor.js    # Data validation
├── templates/
│   ├── changelog-template.md      # For documenting changes
│   └── migration-template.json    # For data migrations
└── output/
    ├── changes-summary.json       # Summary of changes made
    └── backup/                    # Previous versions
```

### **2. Automated Update Process**

**Add these npm scripts to `package.json`:**

```json
{
  "scripts": {
    "update-tax-data": "node tax-update-system/main.js",
    "update-federal": "node tax-update-system/processors/federal-processor.js",
    "update-states": "node tax-update-system/processors/state-processor.js",
    "validate-updates": "node tax-update-system/processors/validation-processor.js",
    "backup-data": "node tax-update-system/backup.js",
    "generate-changelog": "node tax-update-system/changelog-generator.js"
  }
}
```

### **3. Version Control for Tax Data**

**Implement a version tracking system:**

```typescript
// lib/tax-version-manager.ts
interface TaxDataVersion {
  taxYear: number;
  effectiveDate: string;
  federal: {
    brackets: object;
    standardDeduction: object;
    credits: object[];
  };
  states: Record<string, StateTaxData>;
  changelog: string[];
  validated: boolean;
  lastUpdated: string;
}
```

### **4. Federal Tax Update Processor**

**Create `tax-update-system/processors/federal-processor.js`:**

```javascript
// Handles federal tax law changes
const federalUpdates = {
  async updateBrackets(taxYear) {
    // Update federal income tax brackets
    // Update capital gains brackets
    // Update standard deductions
    // Update personal exemptions
  },
  
  async updateCredits(taxYear) {
    // Update EITC amounts and thresholds
    // Update CTC amounts and phaseouts
    // Update AOTC/LLC amounts
    // Update other federal credits
  },
  
  async updateDeductions(taxYear) {
    // Update standard deduction amounts
    // Update itemized deduction limits
    // Update phase-out thresholds
  }
};
```

### **5. State Tax Update Processor**

**Create `tax-update-system/processors/state-processor.js`:**

```javascript
// Handles state-specific tax changes
const stateUpdates = {
  async updateStateBrackets(state, taxYear) {
    // Update income tax brackets by filing status
    // Update standard deductions
    // Update personal exemptions
  },
  
  async updateStateCredits(state, taxYear) {
    // Update state-specific credits
    // Update refundability rules
    // Update phase-out amounts
  },
  
  async updatePropertyTax(state, taxYear) {
    // Update property tax rates
    // Update assessment methods
    // Update exemptions
  }
};
```

### **6. Change Documentation System**

**Implement automatic changelog generation:**

```javascript
// tax-update-system/changelog-generator.js
const generateChangelog = async (changes) => {
  const changelog = {
    taxYear: changes.taxYear,
    effectiveDate: changes.effectiveDate,
    sections: {
      federal: {
        brackets: changes.federal.brackets,
        credits: changes.federal.credits,
        deductions: changes.federal.deductions
      },
      states: changes.states,
      impact: {
        averageTaxChange: calculateAverageImpact(changes),
        affectedFilers: estimateAffectedFilers(changes)
      }
    }
  };
  
  // Generate markdown version for human reading
  const markdown = generateMarkdownChangelog(changelog);
  
  return { json: changelog, markdown };
};
```

### **7. Data Validation & Testing**

**Create comprehensive validation system:**

```javascript
// tax-update-system/processors/validation-processor.js
const validators = {
  async validateFederalData(data) {
    // Validate bracket structure
    // Validate rate calculations
    // Cross-reference with IRS publications
  },
  
  async validateStateData(state, data) {
    // Validate against state revenue department data
    // Check bracket consistency
    // Validate calculation results
  },
  
  async runRegressionTests() {
    // Test sample tax calculations
    // Compare against previous year results
    // Flag significant changes for review
  }
};
```

### **8. Historical Comparison Features**

**Add comparison capabilities to your existing calculator:**

```typescript
// lib/historical-tax-comparator.ts
export const compareTaxYears = (currentYear, previousYear, userData) => {
  const currentTax = calculateTax(currentYear, userData);
  const previousTax = calculateTax(previousYear, userData);
  
  return {
    taxDifference: currentTax - previousTax,
    percentageChange: ((currentTax - previousTax) / previousTax) * 100,
    bracketChanges: identifyBracketImpacts(userData),
    deductionChanges: identifyDeductionImpacts(userData),
    creditChanges: identifyCreditImpacts(userData)
  };
};
```

### **9. User Interface for Updates**

**Create an admin interface for managing updates:**

```typescript
// app/admin/tax-updates/page.tsx
const TaxUpdatesAdmin = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  
  const handleUpdate = async (updateType) => {
    // Trigger appropriate update processor
    // Show progress and results
    // Generate documentation
  };
  
  return (
    <div>
      <h1>Tax Update Management</h1>
      <VersionStatus currentVersion={currentVersion} />
      <UpdateButtons onUpdate={handleUpdate} />
      <ChangeLog changes={pendingChanges} />
    </div>
  );
};
```

### **10. Integration with Existing System**

**Update your `lib/utils.ts` to support versioning:**

```typescript
// Add version awareness to tax calculations
export function calculateAndStoreAGI(basicInfo, income, creditsDeductions, taxYear = new Date().getFullYear()) {
  // Load tax data for specific year
  const taxData = loadTaxDataForYear(taxYear);
  
  // Use versioned calculation logic
  // Store version information with results
}
```

### **11. Annual Update Workflow**

**Create a standardized annual update process:**

1. **Pre-Update Phase (January-February):**
   - Monitor legislative changes
   - Collect IRS/state announcements
   - Plan update timeline

2. **Update Phase (March-April):**
   - Run federal update processor
   - Update state data individually
   - Validate all changes

3. **Testing Phase (April-May):**
   - Run comprehensive regression tests
   - Compare calculations across years
   - Validate with tax professionals

4. **Documentation Phase (May-June):**
   - Generate changelog
   - Update user guides
   - Create version documentation

5. **Deployment Phase (June-July):**
   - Deploy updates
   - Monitor for issues
   - Provide user notifications

### **12. Implementation Priority**

**Phase 1 (High Priority - Next 2 weeks):**
- Create basic update framework
- Implement federal tax update processor
- Add version control system
- Create change documentation system

**Phase 2 (Medium Priority - Next 4 weeks):**
- Implement state update processor
- Add comprehensive validation system
- Create admin interface
- Implement historical comparison features

**Phase 3 (Lower Priority - Next 6 weeks):**
- Add automated monitoring for tax law changes
- Implement rollback capabilities
- Create user notification system
- Add advanced testing frameworks

This design leverages your existing infrastructure while providing a robust, scalable system for annual tax updates. The modular approach allows for incremental implementation, and the version control system ensures you can track changes and maintain data integrity over time.

Would you like me to start implementing any specific part of this system?

### Missing Tax Status Inputs

#### Illinois Personal Exemptions - Blind Status (Implemented but not exposed)
- **Backend Implementation**: ✅ Complete
  - Illinois personal exemption calculation includes support for blind taxpayer exemptions (+$1,000 per blind taxpayer/spouse)
  - Function: `calculateIllinoisPersonalExemptions()` in `lib/tax-calculator.ts`
  - Data structure: `additionalPersonalExemptionBlind` field in state tax data
- **Frontend Fields**: ❌ Missing
  - [ ] Add "Taxpayer is legally blind" checkbox to tax input form
  - [ ] Add "Spouse is legally blind" checkbox for married filing jointly
  - [ ] Update `UserTaxInputs` interface to include `isBlind?: boolean` and `spouseIsBlind?: boolean`
- **Current Behavior**: All taxpayers default to "not blind" (blind exemptions = $0)
- **Future Enhancement**: Add frontend fields when blind exemption support is prioritized

**Note**: The blind exemption is relatively uncommon and can be added later if there's user demand. The current implementation correctly calculates all other Illinois exemptions (base $2,850 + age 65+ bonus $1,000).