#!/usr/bin/env node
/**
 * JSX Syntax Validator - Automated Test for JSX Syntax Errors
 * Prevents JSX syntax errors like unclosed tags, mismatched brackets, etc.
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));

class JSXValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checkedFiles = 0;
  }

  async validateProject() {
    console.log('🔍 JSX Syntax Validator - Starting validation...\n');
    
    // Run ESLint specifically for JSX syntax validation
    await this.runESLintValidation();
    
    // Custom JSX structure validation
    await this.validateJSXFiles();
    
    this.printSummary();
    
    // Exit with error code if any syntax errors found
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  async runESLintValidation() {
    return new Promise((resolve) => {
      console.log('📋 Running ESLint JSX validation...');
      
      const eslint = spawn('npx', ['eslint', 'src/**/*.{js,jsx}', '--format=json'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';

      eslint.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      eslint.stderr.on('data', () => {
        // Handle stderr if needed
      });

      eslint.on('close', () => {
        if (stdout.trim()) {
          try {
            const results = JSON.parse(stdout);
            this.processESLintResults(results);
          } catch (e) {
            console.log('⚠️  ESLint output parsing error:', e.message);
          }
        }
        
        resolve();
      });

      eslint.on('error', (err) => {
        console.log('⚠️  ESLint execution error:', err.message);
        resolve();
      });
    });
  }

  processESLintResults(results) {
    results.forEach(result => {
      if (result.messages.length > 0) {
        const fileName = result.filePath.split('/').pop();
        
        result.messages.forEach(message => {
          const isJSXError = this.isJSXSyntaxError(message);
          
          if (isJSXError && message.severity === 2) {
            this.errors.push({
              file: fileName,
              line: message.line,
              column: message.column,
              message: message.message,
              rule: message.ruleId
            });
          } else if (isJSXError && message.severity === 1) {
            this.warnings.push({
              file: fileName,
              line: message.line,
              column: message.column,
              message: message.message,
              rule: message.ruleId
            });
          }
        });
      }
    });
  }

  isJSXSyntaxError(message) {
    const jsxRules = [
      'react/jsx-closing-tag-location',
      'react/jsx-closing-bracket-location', 
      'react/jsx-tag-spacing',
      'react/jsx-no-undef',
      'react/jsx-uses-vars',
      'react/jsx-key',
      'react/jsx-no-duplicate-props',
      'react/self-closing-comp',
      'react/jsx-wrap-multilines'
    ];

    const jsxErrorPatterns = [
      /jsx/i,
      /closing tag/i,
      /opening tag/i,
      /bracket/i,
      /fragment/i,
      /component/i
    ];

    return jsxRules.includes(message.ruleId) || 
           jsxErrorPatterns.some(pattern => pattern.test(message.message));
  }

  async validateJSXFiles() {
    console.log('🔧 Running custom JSX structure validation...');
    
    const jsxFiles = this.findJSXFiles('src');
    
    for (const file of jsxFiles) {
      this.validateJSXStructure(file);
      this.checkedFiles++;
    }
  }

  findJSXFiles(dir) {
    const files = [];
    try {
      // Use already imported fs functions
      const items = readdirSync(join(__dirname, dir));
      
      for (const item of items) {
        const fullPath = join(__dirname, dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.findJSXFiles(join(dir, item)));
        } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  validateJSXStructure(filePath) {
    if (!existsSync(filePath)) return;
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileName = filePath.split('/').pop();
      
      // Enhanced JSX syntax validation
      this.checkUnclosedTags(content, fileName);
      this.checkMismatchedBrackets(content, fileName);
      this.checkInvalidJSXStructure(content, fileName);
      
      // NEW: Advanced validation methods
      this.checkAdjacentJSXElements(content, fileName);
      this.checkConditionalRenderingBlocks(content, fileName);
      this.checkJSXFragmentUsage(content, fileName);
      this.checkBraceBalance(content, fileName);
      this.checkReturnStatementStructure(content, fileName);
      
    } catch (error) {
      this.errors.push({
        file: filePath.split('/').pop(),
        line: 0,
        column: 0,
        message: `File read error: ${error.message}`,
        rule: 'file-access'
      });
    }
  }

  checkUnclosedTags(content, fileName) {
    const lines = content.split('\n');
    const tagStack = [];
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Find opening tags
      const openTags = line.match(/<[A-Z][a-zA-Z0-9]*[^/>]*[^/]>/g) || [];
      openTags.forEach(tag => {
        const tagName = tag.match(/<([A-Z][a-zA-Z0-9]*)/)[1];
        tagStack.push({ tag: tagName, line: lineNum, column: line.indexOf(tag) + 1 });
      });
      
      // Find closing tags
      const closeTags = line.match(/<\/[A-Z][a-zA-Z0-9]*>/g) || [];
      closeTags.forEach(tag => {
        const tagName = tag.match(/<\/([A-Z][a-zA-Z0-9]*)/)[1];
        const lastOpen = tagStack.pop();
        
        if (!lastOpen) {
          this.errors.push({
            file: fileName,
            line: lineNum,
            column: line.indexOf(tag) + 1,
            message: `Unexpected closing tag </${tagName}>`,
            rule: 'jsx-structure'
          });
        } else if (lastOpen.tag !== tagName) {
          this.errors.push({
            file: fileName,
            line: lineNum,
            column: line.indexOf(tag) + 1,
            message: `Mismatched closing tag: expected </${lastOpen.tag}> but found </${tagName}>`,
            rule: 'jsx-structure'
          });
        }
      });
    });
    
    // Check for unclosed tags
    tagStack.forEach(unclosed => {
      this.errors.push({
        file: fileName,
        line: unclosed.line,
        column: unclosed.column,
        message: `Unclosed tag <${unclosed.tag}>`,
        rule: 'jsx-structure'
      });
    });
  }

  checkMismatchedBrackets(content, fileName) {
    // Disabled - too many false positives with normal JS syntax
    // This level of validation is better handled by ESLint and the compiler
  }

  checkInvalidJSXStructure(content, fileName) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for incomplete JSX elements
      if (line.includes('<') && !line.includes('>')) {
        const nextLine = lines[index + 1];
        if (!nextLine || !nextLine.trim().startsWith('>')) {
          this.warnings.push({
            file: fileName,
            line: lineNum,
            column: line.indexOf('<') + 1,
            message: 'Potentially incomplete JSX element',
            rule: 'jsx-structure'
          });
        }
      }
      
      // Check for malformed self-closing tags
      const malformedSelfClosing = line.match(/<[A-Za-z][^>]*[^/]>/g);
      if (malformedSelfClosing) {
        malformedSelfClosing.forEach(tag => {
          if (tag.includes('style=') || tag.includes('onClick=') || tag.includes('className=')) {
            // This might need to be self-closing
            const tagName = tag.match(/<([A-Za-z][A-Za-z0-9]*)/)?.[1];
            if (tagName && ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName.toLowerCase())) {
              this.warnings.push({
                file: fileName,
                line: lineNum,
                column: line.indexOf(tag) + 1,
                message: `Element <${tagName}> should be self-closing`,
                rule: 'jsx-structure'
              });
            }
          }
        });
      }
    });
  }

  printSummary() {
    console.log('\n📊 JSX Validation Summary:');
    console.log('=' .repeat(50));
    console.log(`Files checked: ${this.checkedFiles}`);
    console.log(`Errors found: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log('=' .repeat(50));

    if (this.errors.length > 0) {
      console.log('\n❌ JSX SYNTAX ERRORS:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.file}:${error.line}:${error.column}`);
        console.log(`   ${error.message}`);
        if (error.rule) console.log(`   Rule: ${error.rule}`);
        console.log('');
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  JSX WARNINGS:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.file}:${warning.line}:${warning.column}`);
        console.log(`   ${warning.message}`);
        if (warning.rule) console.log(`   Rule: ${warning.rule}`);
        console.log('');
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All JSX files passed syntax validation!');
    }

    if (this.errors.length > 0) {
      console.log('💡 Fix the JSX syntax errors above to prevent build failures.');
      console.log('   Common fixes:');
      console.log('   • Add missing closing tags');
      console.log('   • Fix mismatched opening/closing tags');
      console.log('   • Balance curly braces and parentheses');
      console.log('   • Use self-closing tags for void elements');
    }
  }

  // NEW ADVANCED VALIDATION METHODS

  checkAdjacentJSXElements(content, fileName) {
    const lines = content.split('\n');
    let insideJSX = false;
    let jsxStack = [];
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      // Track JSX context - simple heuristic
      if (trimmedLine.includes('return (') || trimmedLine.includes('return(')) {
        insideJSX = true;
      }
      
      if (insideJSX) {
        // Check for adjacent elements pattern (closing tag followed by opening tag)
        const adjacentPattern = />\s*<[A-Za-z]/;
        if (adjacentPattern.test(line) && !line.includes('//') && !line.includes('/*')) {
          // Additional check: make sure this isn't inside a proper wrapper
          const beforeTag = line.substring(0, line.indexOf('<'));
          const afterTag = line.substring(line.lastIndexOf('>') + 1);
          
          // If we see adjacent elements that aren't wrapped
          if (!beforeTag.includes('<') && afterTag.includes('<')) {
            this.errors.push({
              file: fileName,
              line: lineNum,
              column: line.indexOf('<') + 1,
              message: 'Adjacent JSX elements must be wrapped in an enclosing tag or React Fragment',
              rule: 'adjacent-jsx-elements'
            });
          }
        }
        
        // Track JSX nesting
        const openTags = (line.match(/<[A-Za-z][^>]*[^/]>/g) || []).length;
        const closeTags = (line.match(/<\/[A-Za-z][^>]*>/g) || []).length;
        const selfClosing = (line.match(/<[A-Za-z][^>]*\/>/g) || []).length;
        
        jsxStack.push({ open: openTags - selfClosing, close: closeTags });
      }
      
      if (trimmedLine.includes('};') && insideJSX) {
        insideJSX = false;
        // Validate JSX balance
        const totalOpen = jsxStack.reduce((sum, item) => sum + item.open, 0);
        const totalClose = jsxStack.reduce((sum, item) => sum + item.close, 0);
        
        if (totalOpen !== totalClose) {
          this.errors.push({
            file: fileName,
            line: lineNum,
            column: 1,
            message: `Unbalanced JSX elements: ${totalOpen} opening tags vs ${totalClose} closing tags`,
            rule: 'jsx-balance'
          });
        }
        jsxStack = [];
      }
    });
  }

  checkConditionalRenderingBlocks(content, fileName) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for common conditional rendering issues
      
      // 1. Invalid '}' characters in JSX context
      if (line.includes(')}') && line.includes('<') && !line.includes('//')) {
        // Check if '}' appears after JSX without proper wrapping
        const jsxIndex = line.indexOf('<');
        const braceIndex = line.indexOf(')}');
        
        if (jsxIndex >= 0 && braceIndex >= 0 && braceIndex < jsxIndex) {
          const beforeJSX = line.substring(0, jsxIndex);
          if (!beforeJSX.includes('{') || beforeJSX.split('{').length !== beforeJSX.split('}').length + 1) {
            this.errors.push({
              file: fileName,
              line: lineNum,
              column: braceIndex + 1,
              message: 'Invalid "}" character in JSX context - check conditional rendering syntax',
              rule: 'jsx-conditional-syntax'
            });
          }
        }
      }
      
      // 2. Check for incomplete conditional blocks
      const conditionalPattern = /\{\s*\w+\s*&&\s*$/;
      if (conditionalPattern.test(line.trim())) {
        this.warnings.push({
          file: fileName,
          line: lineNum,
          column: line.indexOf('{') + 1,
          message: 'Incomplete conditional rendering block - missing JSX element',
          rule: 'incomplete-conditional'
        });
      }
      
      // 3. Check for ternary operator issues
      const ternaryPattern = /\?\s*<[^>]*>\s*:\s*<[^>]*>/;
      if (line.includes('?') && line.includes(':') && line.includes('<')) {
        if (!ternaryPattern.test(line) && line.includes('?') && line.includes(':')) {
          this.warnings.push({
            file: fileName,
            line: lineNum,
            column: line.indexOf('?') + 1,
            message: 'Complex ternary operator in JSX - consider simplifying',
            rule: 'jsx-ternary-complexity'
          });
        }
      }
    });
  }

  checkJSXFragmentUsage(content, fileName) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for mismatched fragment usage
      if (line.includes('<>') && !line.includes('</>')) {
        const nextLines = lines.slice(index + 1, index + 10);
        const hasClosingFragment = nextLines.some(nextLine => nextLine.includes('</>'));
        
        if (!hasClosingFragment) {
          this.errors.push({
            file: fileName,
            line: lineNum,
            column: line.indexOf('<>') + 1,
            message: 'Opening React Fragment <> without corresponding closing fragment </>',
            rule: 'jsx-fragment-mismatch'
          });
        }
      }
      
      // Check for Fragment vs <> consistency
      if ((line.includes('<Fragment>') || line.includes('<React.Fragment>')) && line.includes('<>')) {
        this.warnings.push({
          file: fileName,
          line: lineNum,
          column: 1,
          message: 'Mixed Fragment syntax - use either <Fragment> or <> consistently',
          rule: 'jsx-fragment-consistency'
        });
      }
    });
  }

  checkBraceBalance(content, fileName) {
    const lines = content.split('\n');
    let braceStack = [];
    let parenStack = [];
    let inJSX = false;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Simple JSX detection
      if (line.includes('return (') || line.includes('return(')) {
        inJSX = true;
      }
      
      if (inJSX) {
        // Track braces and parentheses
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const prevChar = i > 0 ? line[i-1] : '';
          const nextChar = i < line.length - 1 ? line[i+1] : '';
          
          switch (char) {
            case '{':
              braceStack.push({ line: lineNum, col: i + 1 });
              break;
            case '}':
              if (braceStack.length === 0) {
                this.errors.push({
                  file: fileName,
                  line: lineNum,
                  column: i + 1,
                  message: 'Unexpected closing brace "}" - no matching opening brace',
                  rule: 'brace-balance'
                });
              } else {
                braceStack.pop();
              }
              break;
            case '(':
              parenStack.push({ line: lineNum, col: i + 1 });
              break;
            case ')':
              if (parenStack.length === 0) {
                this.errors.push({
                  file: fileName,
                  line: lineNum,
                  column: i + 1,
                  message: 'Unexpected closing parenthesis ")" - no matching opening parenthesis',
                  rule: 'paren-balance'
                });
              } else {
                parenStack.pop();
              }
              break;
          }
        }
      }
      
      if (line.includes('};') && inJSX) {
        inJSX = false;
        
        // Report any unmatched braces/parens at end of component
        braceStack.forEach(brace => {
          this.errors.push({
            file: fileName,
            line: brace.line,
            column: brace.col,
            message: 'Unclosed opening brace "{" - missing closing brace',
            rule: 'brace-balance'
          });
        });
        
        parenStack.forEach(paren => {
          this.errors.push({
            file: fileName,
            line: paren.line,
            column: paren.col,
            message: 'Unclosed opening parenthesis "(" - missing closing parenthesis',
            rule: 'paren-balance'
          });
        });
        
        braceStack = [];
        parenStack = [];
      }
    });
  }

  checkReturnStatementStructure(content, fileName) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check return statement patterns
      if (line.includes('return ') && line.includes('<')) {
        // Single line return with JSX - should be simple
        const returnMatch = line.match(/return\s*(.+)$/);
        if (returnMatch) {
          const returnContent = returnMatch[1].trim();
          
          // Check for multiple top-level elements
          const topLevelElements = returnContent.match(/<[A-Za-z][^>]*>/g);
          if (topLevelElements && topLevelElements.length > 1) {
            // Check if they're properly wrapped
            if (!returnContent.startsWith('(') || !returnContent.endsWith(')')) {
              this.errors.push({
                file: fileName,
                line: lineNum,
                column: line.indexOf('return') + 1,
                message: 'Multiple JSX elements in return must be wrapped in parentheses or single parent element',
                rule: 'return-jsx-structure'
              });
            }
          }
        }
      }
      
      // Check for return statement spanning multiple lines
      if (line.trim() === 'return (' || line.trim() === 'return(') {
        // Look ahead to find the closing parenthesis
        let depth = 1;
        let foundClosing = false;
        let elementCount = 0;
        
        for (let i = index + 1; i < lines.length && depth > 0; i++) {
          const nextLine = lines[i];
          
          // Count parentheses
          for (const char of nextLine) {
            if (char === '(') depth++;
            if (char === ')') depth--;
          }
          
          // Count top-level JSX elements
          const jsxElements = nextLine.match(/^\s*<[A-Za-z]/g);
          if (jsxElements) {
            elementCount += jsxElements.length;
          }
          
          if (depth === 0) {
            foundClosing = true;
            break;
          }
        }
        
        if (!foundClosing) {
          this.errors.push({
            file: fileName,
            line: lineNum,
            column: line.indexOf('return') + 1,
            message: 'Unclosed return statement parentheses',
            rule: 'return-paren-balance'
          });
        }
        
        if (elementCount > 1) {
          this.warnings.push({
            file: fileName,
            line: lineNum,
            column: line.indexOf('return') + 1,
            message: 'Multiple top-level JSX elements in return - consider wrapping in Fragment',
            rule: 'multiple-jsx-roots'
          });
        }
      }
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new JSXValidator();
  validator.validateProject().catch(console.error);
}

export default JSXValidator;