#!/usr/bin/env python3
"""
AI Trust & Safety Auditing Agent - Schema Validation Tool v3.1
================================================================

Validates JSON schemas for compliance with Draft-07 specification,
internal consistency, regulatory alignment accuracy, and completeness.

Usage:
    python validate_schemas.py --all                    # Validate all 5 modules
    python validate_schemas.py --module 1               # Validate Module 1 only
    python validate_schemas.py --sample data.json       # Validate sample data against schemas
    python validate_schemas.py --report output.txt      # Generate validation report

Author: Wenguang Li, MASY Student
Date: March 7, 2026
Version: 3.1
"""

import json
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import re

try:
    import jsonschema
    from jsonschema import Draft7Validator, ValidationError
except ImportError:
    print("ERROR: jsonschema library not installed")
    print("Install with: pip install jsonschema --break-system-packages")
    sys.exit(1)


class SchemaValidator:
    """Comprehensive schema validation with regulatory compliance checks"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []
        
        # Expected module structure
        self.required_modules = {
            'module1_governance_schema_v3_1.json': {
                'module_id': 'M1_GOVERNANCE',
                'criteria_count': 7,
                'new_criteria_v3_1': ['G1.6', 'G1.7']
            },
            'module2_fairness_schema_v3_1.json': {
                'module_id': 'M2_FAIRNESS',
                'criteria_count': 4,
                'new_criteria_v3_1': ['F2.4']
            },
            'module3_security_privacy_schema_v3_1.json': {
                'module_id': 'M3_SECURITY_PRIVACY',
                'criteria_count': 6,
                'new_criteria_v3_1': ['S3.4', 'S3.5', 'S3.6']
            },
            'module4_explainability_schema_v3_1.json': {
                'module_id': 'M4_EXPLAINABILITY',
                'criteria_count': 5,
                'new_criteria_v3_1': ['E4.4', 'E4.5']
            },
            'module5_accuracy_schema_v3_1.json': {
                'module_id': 'M5_ACCURACY',
                'criteria_count': 5,
                'new_criteria_v3_1': ['A5.4', 'A5.5']
            }
        }
        
        # GDPR articles for validation
        self.valid_gdpr_articles = {
            'Article 5': 'Principles (lawfulness, fairness, transparency, accuracy, etc.)',
            'Article 6': 'Lawful basis for processing',
            'Article 9': 'Processing of special category data',
            'Articles 13-14': 'Right to information',
            'Article 16': 'Right to rectification',
            'Article 17': 'Right to erasure',
            'Article 22': 'Automated decision-making',
            'Article 24': 'Controller responsibility',
            'Article 25': 'Privacy by Design and Default',
            'Article 30': 'Records of Processing Activities (ROPA)',
            'Article 32': 'Security of processing',
            'Articles 33-34': 'Breach notification',
            'Article 35': 'Data Protection Impact Assessment',
            'Articles 37-39': 'Data Protection Officer'
        }
        
        # CCPA sections for validation
        self.valid_ccpa_sections = {
            '§1798.82': 'California breach notification',
            '§1798.100': 'Right to know',
            '§1798.105': 'Right to delete',
            '§1798.106': 'Right to correct',
            '§1798.125': 'Non-discrimination',
            '§1798.130': 'Business obligations',
            '§1798.150': 'Private right of action',
            '§1798.185': 'Regulations and automated decision-making'
        }
    
    def validate_json_schema(self, schema_path: Path) -> bool:
        """Validate that schema is valid JSON Schema Draft-07"""
        try:
            with open(schema_path, 'r') as f:
                schema = json.load(f)
            
            # Check for Draft-07
            if schema.get('$schema') != 'http://json-schema.org/draft-07/schema#':
                self.errors.append(f"{schema_path.name}: Missing or incorrect $schema declaration")
                return False
            
            # Validate schema structure
            Draft7Validator.check_schema(schema)
            self.info.append(f"✓ {schema_path.name}: Valid JSON Schema Draft-07")
            return True
            
        except json.JSONDecodeError as e:
            self.errors.append(f"{schema_path.name}: Invalid JSON - {e}")
            return False
        except jsonschema.SchemaError as e:
            self.errors.append(f"{schema_path.name}: Invalid schema structure - {e}")
            return False
        except FileNotFoundError:
            self.errors.append(f"{schema_path.name}: File not found")
            return False
    
    def validate_module_structure(self, schema_path: Path) -> bool:
        """Validate module-specific structure and completeness"""
        try:
            with open(schema_path, 'r') as f:
                schema = json.load(f)
            
            module_name = schema_path.name
            expected = self.required_modules.get(module_name)
            
            if not expected:
                self.warnings.append(f"{module_name}: Unknown module (not in expected list)")
                return True  # Don't fail, just warn
            
            # Check module ID
            if schema.get('module_id') != expected['module_id']:
                self.errors.append(f"{module_name}: Incorrect module_id (expected {expected['module_id']}, got {schema.get('module_id')})")
            
            # Check criteria count
            criteria = schema.get('evaluation_criteria', [])
            if len(criteria) != expected['criteria_count']:
                self.errors.append(f"{module_name}: Incorrect criteria count (expected {expected['criteria_count']}, got {len(criteria)})")
            
            # Check for required top-level fields
            required_fields = ['title', 'version', 'module_id', 'module_name', 
                             'evaluation_criteria', 'aggregate_scoring', 
                             'regulatory_alignment']
            missing_fields = [f for f in required_fields if f not in schema]
            if missing_fields:
                self.errors.append(f"{module_name}: Missing required fields: {', '.join(missing_fields)}")
            
            # Check version
            if schema.get('version') != '3.1':
                self.warnings.append(f"{module_name}: Version is {schema.get('version')}, expected 3.1")
            
            self.info.append(f"✓ {module_name}: Structure validation complete")
            return len([e for e in self.errors if module_name in e]) == 0
            
        except Exception as e:
            self.errors.append(f"{schema_path.name}: Structure validation failed - {e}")
            return False
    
    def validate_criteria(self, schema_path: Path) -> bool:
        """Validate individual evaluation criteria"""
        try:
            with open(schema_path, 'r') as f:
                schema = json.load(f)
            
            module_name = schema_path.name
            criteria = schema.get('evaluation_criteria', [])
            
            for i, criterion in enumerate(criteria):
                criterion_id = criterion.get('criterion_id', f'UNKNOWN_{i}')
                
                # Required criterion fields
                required = ['criterion_id', 'criterion_name', 'description', 
                          'check_method', 'pass_criteria', 'evidence_required',
                          'scoring', 'severity_mapping']
                missing = [f for f in required if f not in criterion]
                if missing:
                    self.errors.append(f"{module_name} - {criterion_id}: Missing fields: {', '.join(missing)}")
                
                # Validate scoring structure
                scoring = criterion.get('scoring', {})
                if 'method' not in scoring:
                    self.errors.append(f"{module_name} - {criterion_id}: Missing scoring method")
                
                if scoring.get('method') == 'weighted_factors':
                    factors = scoring.get('factors', {})
                    if factors:
                        total_weight = sum(f.get('weight', 0) for f in factors.values())
                        if abs(total_weight - 1.0) > 0.02:  # Allow 2% tolerance for rounding
                            self.warnings.append(f"{module_name} - {criterion_id}: Factor weights sum to {total_weight:.3f}, should be ~1.0")
                
                # Check for geographic exemption handling (privacy criteria)
                if any(keyword in criterion_id for keyword in ['1.6', '1.7', '2.4', '4.4', '4.5', '5.4', '5.5']) or \
                   any(keyword in criterion_id for keyword in ['3.4', '3.5', '3.6']):
                    # These are privacy-related criteria
                    if 'geographic_exemption' not in scoring and 'applicability' not in criterion.get('evidence_required', {}):
                        self.warnings.append(f"{module_name} - {criterion_id}: Privacy criterion missing geographic exemption documentation")
            
            self.info.append(f"✓ {module_name}: Criteria validation complete ({len(criteria)} criteria)")
            return True
            
        except Exception as e:
            self.errors.append(f"{schema_path.name}: Criteria validation failed - {e}")
            return False
    
    def validate_regulatory_alignment(self, schema_path: Path) -> bool:
        """Validate regulatory citations are accurate"""
        try:
            with open(schema_path, 'r') as f:
                schema = json.load(f)
            
            module_name = schema_path.name
            regulatory = schema.get('regulatory_alignment', {})
            
            # Check GDPR citations
            gdpr_section = regulatory.get('gdpr', {})
            if isinstance(gdpr_section, dict):
                for article_key, description in gdpr_section.items():
                    if article_key == 'applicability':
                        continue
                    # Normalize article reference
                    article_normalized = article_key.replace('_', ' ').title().replace('Articles ', 'Articles ')
                    
                    # Check if valid
                    valid = False
                    for valid_article in self.valid_gdpr_articles.keys():
                        if article_normalized.lower() in valid_article.lower() or valid_article.lower() in article_normalized.lower():
                            valid = True
                            break
                    
                    if not valid:
                        self.warnings.append(f"{module_name}: GDPR citation '{article_key}' not in validated article list")
            
            # Check CCPA citations
            ccpa_section = regulatory.get('ccpa', {})
            if isinstance(ccpa_section, dict):
                for section_key, description in ccpa_section.items():
                    if section_key in ['applicability', 'cpra_section_1798_185_a_16']:
                        continue
                    if not any(section_key.startswith(valid) for valid in self.valid_ccpa_sections.keys()):
                        self.warnings.append(f"{module_name}: CCPA citation '{section_key}' not in validated section list")
            
            self.info.append(f"✓ {module_name}: Regulatory alignment validated")
            return True
            
        except Exception as e:
            self.errors.append(f"{schema_path.name}: Regulatory validation failed - {e}")
            return False
    
    def validate_aggregate_scoring(self, schema_path: Path) -> bool:
        """Validate aggregate scoring methodology"""
        try:
            with open(schema_path, 'r') as f:
                schema = json.load(f)
            
            module_name = schema_path.name
            aggregate = schema.get('aggregate_scoring', {})
            
            # Check required fields
            if 'method' not in aggregate:
                self.errors.append(f"{module_name}: Missing aggregate scoring method")
                return False
            
            if aggregate.get('method') == 'weighted_average':
                weights = aggregate.get('criteria_weights', {})
                if weights:
                    total = sum(weights.values())
                    if abs(total - 1.0) > 0.02:
                        self.warnings.append(f"{module_name}: Criteria weights sum to {total:.3f}, should be ~1.0")
                    
                    # Check all criteria have weights
                    criteria_ids = [c.get('criterion_id') for c in schema.get('evaluation_criteria', [])]
                    for cid in criteria_ids:
                        if cid not in weights:
                            self.errors.append(f"{module_name}: Criterion {cid} missing from criteria_weights")
            
            # Check pass threshold exists
            if 'overall_pass_threshold' not in aggregate:
                self.errors.append(f"{module_name}: Missing overall_pass_threshold")
            
            self.info.append(f"✓ {module_name}: Aggregate scoring validated")
            return True
            
        except Exception as e:
            self.errors.append(f"{schema_path.name}: Aggregate scoring validation failed - {e}")
            return False
    
    def validate_interdependency_triggers(self, schema_path: Path) -> bool:
        """Validate interdependency trigger specifications"""
        try:
            with open(schema_path, 'r') as f:
                schema = json.load(f)
            
            module_name = schema_path.name
            triggers = schema.get('interdependency_triggers', [])
            
            for trigger in triggers:
                # Required trigger fields
                required = ['trigger_id', 'trigger_condition', 'triggered_module', 'action', 'rationale']
                missing = [f for f in required if f not in trigger]
                if missing:
                    self.warnings.append(f"{module_name} - {trigger.get('trigger_id', 'UNKNOWN')}: Missing fields: {', '.join(missing)}")
                
                # Check trigger ID format (should be T#.#)
                trigger_id = trigger.get('trigger_id', '')
                if not re.match(r'^T\d+\.\d+$', trigger_id):
                    self.warnings.append(f"{module_name}: Trigger ID '{trigger_id}' doesn't match expected format (T#.#)")
            
            if triggers:
                self.info.append(f"✓ {module_name}: {len(triggers)} interdependency trigger(s) validated")
            
            return True
            
        except Exception as e:
            self.errors.append(f"{schema_path.name}: Trigger validation failed - {e}")
            return False
    
    def validate_sample_data(self, data_path: Path, schema_path: Path) -> bool:
        """Validate sample data against schema"""
        try:
            with open(schema_path, 'r') as f:
                schema = json.load(f)
            
            with open(data_path, 'r') as f:
                data = json.load(f)
            
            # Validate data against schema
            validator = Draft7Validator(schema)
            errors = list(validator.iter_errors(data))
            
            if errors:
                for error in errors[:5]:  # Show first 5 errors
                    self.errors.append(f"{data_path.name}: {error.message} at path {list(error.path)}")
                if len(errors) > 5:
                    self.errors.append(f"{data_path.name}: ... and {len(errors)-5} more validation errors")
                return False
            else:
                self.info.append(f"✓ {data_path.name}: Valid against {schema_path.name}")
                return True
                
        except Exception as e:
            self.errors.append(f"{data_path.name}: Sample data validation failed - {e}")
            return False
    
    def generate_report(self, output_path: Optional[Path] = None):
        """Generate validation report"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("AI TRUST & SAFETY AUDITING AGENT - SCHEMA VALIDATION REPORT v3.1")
        report_lines.append("=" * 80)
        report_lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append("")
        
        # Summary
        total_errors = len(self.errors)
        total_warnings = len(self.warnings)
        total_info = len(self.info)
        
        report_lines.append("SUMMARY")
        report_lines.append("-" * 80)
        report_lines.append(f"Errors:   {total_errors}")
        report_lines.append(f"Warnings: {total_warnings}")
        report_lines.append(f"Info:     {total_info}")
        report_lines.append("")
        
        # Overall result
        if total_errors == 0:
            report_lines.append("OVERALL RESULT: ✓ PASS - All schemas valid")
        else:
            report_lines.append("OVERALL RESULT: ✗ FAIL - Validation errors found")
        report_lines.append("")
        
        # Errors
        if self.errors:
            report_lines.append("ERRORS")
            report_lines.append("-" * 80)
            for error in self.errors:
                report_lines.append(f"✗ {error}")
            report_lines.append("")
        
        # Warnings
        if self.warnings:
            report_lines.append("WARNINGS")
            report_lines.append("-" * 80)
            for warning in self.warnings:
                report_lines.append(f"⚠ {warning}")
            report_lines.append("")
        
        # Info
        if self.info:
            report_lines.append("INFORMATION")
            report_lines.append("-" * 80)
            for info in self.info:
                report_lines.append(f"  {info}")
            report_lines.append("")
        
        report_lines.append("=" * 80)
        report_lines.append("END OF REPORT")
        report_lines.append("=" * 80)
        
        report_text = "\n".join(report_lines)
        
        # Print to console
        print(report_text)
        
        # Save to file if requested
        if output_path:
            with open(output_path, 'w') as f:
                f.write(report_text)
            print(f"\nReport saved to: {output_path}")
        
        return total_errors == 0


def main():
    parser = argparse.ArgumentParser(
        description='Validate AI Trust & Safety Auditing Agent JSON schemas',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python validate_schemas.py --all
  python validate_schemas.py --module 1
  python validate_schemas.py --sample sample_data.json --schema module1_governance_schema_v3_1.json
  python validate_schemas.py --all --report validation_report.txt
        """
    )
    
    parser.add_argument('--all', action='store_true', help='Validate all 5 module schemas')
    parser.add_argument('--module', type=int, choices=[1,2,3,4,5], help='Validate specific module (1-5)')
    parser.add_argument('--schema', type=str, help='Path to specific schema file')
    parser.add_argument('--sample', type=str, help='Path to sample data file to validate')
    parser.add_argument('--report', type=str, help='Path to save validation report')
    parser.add_argument('--dir', type=str, default='/mnt/user-data/outputs', help='Directory containing schemas')
    
    args = parser.parse_args()
    
    validator = SchemaValidator()
    schema_dir = Path(args.dir)
    
    schemas_to_validate = []
    
    # Determine which schemas to validate
    if args.all:
        schemas_to_validate = list(validator.required_modules.keys())
    elif args.module:
        module_map = {
            1: 'module1_governance_schema_v3_1.json',
            2: 'module2_fairness_schema_v3_1.json',
            3: 'module3_security_privacy_schema_v3_1.json',
            4: 'module4_explainability_schema_v3_1.json',
            5: 'module5_accuracy_schema_v3_1.json'
        }
        schemas_to_validate = [module_map[args.module]]
    elif args.schema:
        schemas_to_validate = [args.schema]
    else:
        parser.print_help()
        return
    
    # Validate schemas
    print(f"\nValidating {len(schemas_to_validate)} schema(s)...\n")
    
    all_passed = True
    for schema_name in schemas_to_validate:
        schema_path = schema_dir / schema_name
        
        print(f"Validating {schema_name}...")
        
        # Run all validation checks
        passed = True
        passed &= validator.validate_json_schema(schema_path)
        passed &= validator.validate_module_structure(schema_path)
        passed &= validator.validate_criteria(schema_path)
        passed &= validator.validate_regulatory_alignment(schema_path)
        passed &= validator.validate_aggregate_scoring(schema_path)
        passed &= validator.validate_interdependency_triggers(schema_path)
        
        all_passed &= passed
        print()
    
    # Validate sample data if provided
    if args.sample and args.schema:
        sample_path = Path(args.sample)
        schema_path = schema_dir / args.schema if not Path(args.schema).is_absolute() else Path(args.schema)
        validator.validate_sample_data(sample_path, schema_path)
    
    # Generate report
    report_path = Path(args.report) if args.report else None
    final_result = validator.generate_report(report_path)
    
    # Exit with appropriate code
    sys.exit(0 if final_result else 1)


if __name__ == '__main__':
    main()
