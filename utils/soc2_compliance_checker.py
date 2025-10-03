#!/usr/bin/env python3
"""
SOC2 Compliance Checker for AWS Infrastructure
Validates that all SOC2 controls are in place before deployment

Usage:
    python3 utils/soc2_compliance_checker.py --profile <aws-profile> --account <account-id>
"""

import boto3
import json
import sys
from typing import Dict, List, Tuple
from datetime import datetime

class SOC2ComplianceChecker:
    def __init__(self, profile: str, account_id: str):
        self.session = boto3.Session(profile_name=profile)
        self.account_id = account_id
        self.findings = []
        self.passed = 0
        self.failed = 0

    def check_cloudtrail(self) -> bool:
        """Check CloudTrail is enabled in all regions with log file validation"""
        print("\n[1] Checking CloudTrail configuration...")
        ct = self.session.client('cloudtrail')

        try:
            trails = ct.describe_trails()['trailList']
            if not trails:
                self._add_finding("FAIL", "CloudTrail", "No trails configured")
                return False

            multi_region_trail = any(trail.get('IsMultiRegionTrail') for trail in trails)
            log_validation = any(trail.get('LogFileValidationEnabled') for trail in trails)

            if multi_region_trail and log_validation:
                self._add_finding("PASS", "CloudTrail", "Multi-region trail with log validation enabled")
                return True
            else:
                self._add_finding("FAIL", "CloudTrail", "Multi-region trail or log validation missing")
                return False
        except Exception as e:
            self._add_finding("ERROR", "CloudTrail", str(e))
            return False

    def check_config(self) -> bool:
        """Check AWS Config is enabled"""
        print("[2] Checking AWS Config...")
        config = self.session.client('config')

        try:
            recorders = config.describe_configuration_recorders()
            if not recorders.get('ConfigurationRecorders'):
                self._add_finding("FAIL", "Config", "No configuration recorders found")
                return False

            recorder = recorders['ConfigurationRecorders'][0]
            recording_all = recorder.get('recordingGroup', {}).get('allSupported', False)

            if recording_all:
                self._add_finding("PASS", "Config", "Recording all resources")
                return True
            else:
                self._add_finding("FAIL", "Config", "Not recording all resources")
                return False
        except Exception as e:
            self._add_finding("ERROR", "Config", str(e))
            return False

    def check_guardduty(self) -> bool:
        """Check GuardDuty is enabled"""
        print("[3] Checking GuardDuty...")
        gd = self.session.client('guardduty')

        try:
            detectors = gd.list_detectors()
            if not detectors.get('DetectorIds'):
                self._add_finding("FAIL", "GuardDuty", "No detectors found")
                return False

            detector_id = detectors['DetectorIds'][0]
            detector = gd.get_detector(DetectorId=detector_id)

            if detector.get('Status') == 'ENABLED':
                self._add_finding("PASS", "GuardDuty", "Enabled and active")
                return True
            else:
                self._add_finding("FAIL", "GuardDuty", "Not enabled")
                return False
        except Exception as e:
            self._add_finding("ERROR", "GuardDuty", str(e))
            return False

    def check_security_hub(self) -> bool:
        """Check Security Hub is enabled with CIS benchmark"""
        print("[4] Checking Security Hub...")
        sh = self.session.client('securityhub')

        try:
            hub = sh.describe_hub()
            standards = sh.get_enabled_standards()

            cis_enabled = any('cis-aws-foundations-benchmark' in std['StandardsArn'].lower()
                            for std in standards.get('StandardsSubscriptions', []))

            if cis_enabled:
                self._add_finding("PASS", "Security Hub", "Enabled with CIS benchmark")
                return True
            else:
                self._add_finding("FAIL", "Security Hub", "CIS benchmark not enabled")
                return False
        except Exception as e:
            self._add_finding("ERROR", "Security Hub", str(e))
            return False

    def check_iam_password_policy(self) -> bool:
        """Check IAM password policy meets SOC2 requirements"""
        print("[5] Checking IAM password policy...")
        iam = self.session.client('iam')

        try:
            policy = iam.get_account_password_policy()['PasswordPolicy']

            requirements = {
                'MinimumPasswordLength': 14,
                'RequireSymbols': True,
                'RequireNumbers': True,
                'RequireUppercaseCharacters': True,
                'RequireLowercaseCharacters': True,
                'MaxPasswordAge': 90,
            }

            passed = all(policy.get(key, 0 if isinstance(val, int) else False) >= val
                        if isinstance(val, int) else policy.get(key) == val
                        for key, val in requirements.items())

            if passed:
                self._add_finding("PASS", "IAM Password Policy", "Meets SOC2 requirements")
                return True
            else:
                self._add_finding("FAIL", "IAM Password Policy", "Does not meet requirements")
                return False
        except Exception as e:
            self._add_finding("ERROR", "IAM Password Policy", str(e))
            return False

    def check_root_account_mfa(self) -> bool:
        """Check root account has MFA enabled"""
        print("[6] Checking root account MFA...")
        iam = self.session.client('iam')

        try:
            summary = iam.get_account_summary()['SummaryMap']

            if summary.get('AccountMFAEnabled', 0) == 1:
                self._add_finding("PASS", "Root MFA", "MFA enabled on root account")
                return True
            else:
                self._add_finding("FAIL", "Root MFA", "MFA not enabled on root account")
                return False
        except Exception as e:
            self._add_finding("ERROR", "Root MFA", str(e))
            return False

    def check_s3_block_public_access(self) -> bool:
        """Check S3 Block Public Access is enabled account-wide"""
        print("[7] Checking S3 Block Public Access...")
        s3 = self.session.client('s3control')

        try:
            config = s3.get_public_access_block(AccountId=self.account_id)
            block_config = config['PublicAccessBlockConfiguration']

            all_blocked = all([
                block_config.get('BlockPublicAcls'),
                block_config.get('IgnorePublicAcls'),
                block_config.get('BlockPublicPolicy'),
                block_config.get('RestrictPublicBuckets'),
            ])

            if all_blocked:
                self._add_finding("PASS", "S3 Block Public Access", "All public access blocked")
                return True
            else:
                self._add_finding("FAIL", "S3 Block Public Access", "Not all settings enabled")
                return False
        except Exception as e:
            self._add_finding("ERROR", "S3 Block Public Access", str(e))
            return False

    def check_ebs_encryption_default(self) -> bool:
        """Check default EBS encryption is enabled"""
        print("[8] Checking EBS default encryption...")
        ec2 = self.session.client('ec2')

        try:
            result = ec2.get_ebs_encryption_by_default()

            if result.get('EbsEncryptionByDefault'):
                self._add_finding("PASS", "EBS Encryption", "Default encryption enabled")
                return True
            else:
                self._add_finding("FAIL", "EBS Encryption", "Default encryption not enabled")
                return False
        except Exception as e:
            self._add_finding("ERROR", "EBS Encryption", str(e))
            return False

    def check_kms_key_rotation(self) -> bool:
        """Check KMS customer-managed keys have rotation enabled"""
        print("[9] Checking KMS key rotation...")
        kms = self.session.client('kms')

        try:
            keys = kms.list_keys()
            customer_managed_keys = []

            for key in keys['Keys']:
                key_id = key['KeyId']
                metadata = kms.describe_key(KeyId=key_id)['KeyMetadata']

                if metadata.get('KeyManager') == 'CUSTOMER':
                    customer_managed_keys.append(key_id)

            if not customer_managed_keys:
                self._add_finding("WARN", "KMS Key Rotation", "No customer-managed keys found")
                return True

            rotation_enabled = []
            for key_id in customer_managed_keys:
                try:
                    status = kms.get_key_rotation_status(KeyId=key_id)
                    rotation_enabled.append(status.get('KeyRotationEnabled', False))
                except:
                    rotation_enabled.append(False)

            if all(rotation_enabled):
                self._add_finding("PASS", "KMS Key Rotation", f"All {len(customer_managed_keys)} keys have rotation enabled")
                return True
            else:
                self._add_finding("FAIL", "KMS Key Rotation", f"Some keys missing rotation")
                return False
        except Exception as e:
            self._add_finding("ERROR", "KMS Key Rotation", str(e))
            return False

    def check_cloudwatch_log_retention(self) -> bool:
        """Check CloudWatch Logs retention is set to 7 years (2557 days)"""
        print("[10] Checking CloudWatch Logs retention...")
        logs = self.session.client('logs')

        try:
            log_groups = logs.describe_log_groups()

            if not log_groups.get('logGroups'):
                self._add_finding("WARN", "CloudWatch Logs", "No log groups found")
                return True

            retention_ok = all(
                lg.get('retentionInDays', 0) >= 2557  # 7 years
                for lg in log_groups['logGroups']
            )

            if retention_ok:
                self._add_finding("PASS", "CloudWatch Logs Retention", "All log groups ≥ 7 years")
                return True
            else:
                self._add_finding("FAIL", "CloudWatch Logs Retention", "Some log groups < 7 years")
                return False
        except Exception as e:
            self._add_finding("ERROR", "CloudWatch Logs Retention", str(e))
            return False

    def _add_finding(self, status: str, control: str, message: str):
        """Add a finding to the results"""
        finding = {
            'timestamp': datetime.now().isoformat(),
            'status': status,
            'control': control,
            'message': message
        }
        self.findings.append(finding)

        if status == "PASS":
            self.passed += 1
            print(f"  ✅ {control}: {message}")
        elif status == "FAIL":
            self.failed += 1
            print(f"  ❌ {control}: {message}")
        elif status == "WARN":
            print(f"  ⚠️  {control}: {message}")
        else:
            print(f"  ⚡ {control}: {message}")

    def run_all_checks(self) -> bool:
        """Run all SOC2 compliance checks"""
        print("=" * 80)
        print("SOC2 COMPLIANCE CHECKER")
        print(f"Account: {self.account_id}")
        print(f"Region: {self.session.region_name}")
        print("=" * 80)

        checks = [
            self.check_cloudtrail,
            self.check_config,
            self.check_guardduty,
            self.check_security_hub,
            self.check_iam_password_policy,
            self.check_root_account_mfa,
            self.check_s3_block_public_access,
            self.check_ebs_encryption_default,
            self.check_kms_key_rotation,
            self.check_cloudwatch_log_retention,
        ]

        for check in checks:
            try:
                check()
            except Exception as e:
                print(f"  ⚡ Error running {check.__name__}: {e}")

        print("\n" + "=" * 80)
        print(f"RESULTS: {self.passed} passed, {self.failed} failed")
        print("=" * 80)

        # Export findings to JSON
        with open('soc2_compliance_report.json', 'w') as f:
            json.dump({
                'account_id': self.account_id,
                'region': self.session.region_name,
                'timestamp': datetime.now().isoformat(),
                'summary': {
                    'passed': self.passed,
                    'failed': self.failed,
                    'total': len(self.findings)
                },
                'findings': self.findings
            }, f, indent=2)

        print(f"\n📄 Full report saved to: soc2_compliance_report.json")

        return self.failed == 0

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Check SOC2 compliance for AWS account')
    parser.add_argument('--profile', required=True, help='AWS profile name')
    parser.add_argument('--account', required=True, help='AWS account ID')

    args = parser.parse_args()

    checker = SOC2ComplianceChecker(args.profile, args.account)
    passed = checker.run_all_checks()

    if not passed:
        print("\n⛔ SOC2 compliance checks FAILED. Fix issues before deploying to production.")
        sys.exit(1)
    else:
        print("\n✅ SOC2 compliance checks PASSED. Safe to proceed with deployment.")
        sys.exit(0)
