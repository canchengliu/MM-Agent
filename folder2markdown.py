import sys
import os

# ignores = ['components/ui/accordion.tsx','components/ui/badge.tsx','components/ui/button.tsx','components/ui/card.tsx','components/ui/checkbox.tsx','components/ui/collapsible.tsx','components/ui/command.tsx','components/ui/dialog.tsx','components/ui/dropdown-menu.tsx','components/ui/form.tsx','components/ui/input.tsx','components/ui/label.tsx','components/ui/popover.tsx','components/ui/resizable.tsx','components/ui/scroll-area.tsx','components/ui/select.tsx','components/ui/separator.tsx','components/ui/sheet.tsx','components/ui/skeleton.tsx','components/ui/slider.tsx','components/ui/switch.tsx','components/ui/tabs.tsx','components/ui/textarea.tsx','components/ui/tooltip.tsx','components/ui/icons/magic.tsx','components/magicui/aurora-text.tsx','components/magicui/bento-grid.tsx','components/magicui/border-beam.tsx','components/magicui/flickering-grid.tsx','components/magicui/number-ticker.tsx','components/magicui/shine-border.tsx','components/deer-flow/fav-icon.tsx','components/deer-flow/image.tsx','components/deer-flow/link.tsx','components/deer-flow/loading-animation.module.css','components/deer-flow/loading-animation.tsx','components/deer-flow/logo.tsx','components/deer-flow/markdown.tsx','components/deer-flow/rainbow-text.module.css','components/deer-flow/rainbow-text.tsx','components/deer-flow/rolling-text.tsx','components/deer-flow/scroll-container.tsx','components/deer-flow/toaster.tsx','components/deer-flow/tooltip.tsx','components/deer-flow/icons/detective.tsx','components/deer-flow/icons/enhance.tsx','components/deer-flow/icons/report-style.tsx','components/theme-provider.tsx','components/AppProviders.tsx','components/deer-flow/theme-provider-wrapper.tsx','components/deer-flow/theme-toggle.tsx','i18n-config.ts','i18n.ts','middleware.ts','navigation.ts','app/[locale]/layout.tsx','lib/queryClient.ts','lib/utils.ts','hooks/use-intersection-observer.ts','hooks/use-mobile.ts','core/utils/deep-clone.ts','core/utils/index.ts','core/utils/json.ts','core/utils/markdown.ts','core/utils/time.ts','core/markdown/katex.ts','core/rehype/index.ts','core/rehype/rehype-split-words-into-spans.ts','core/auth/sessionEvents.ts','core/api/client.ts','styles/globals.css','styles/prosemirror.css','typings/md.d.ts','app/[locale]/landing/components/multi-agent-visualization.tsx','app/[locale]/landing/store/graph.ts','app/[locale]/landing/store/mav-store.ts','app/[locale]/landing/store/playbook.ts','app/[locale]/landing/components/ray.tsx','app/[locale]/landing/components/section-header.tsx']
ignores = []
# keeps = ['src/mmw/services/infrastructure', 'src/mmw/workflow', 'src/rapid_insight', 'src/rapid_insight_cli.py']
keeps = [] #  
# keeps =['mmw/utils/serialization.py', 'mmw/workflow/schemas/', 'rapid_insight/schemas/', 'mmw/api/v1/schemas/', 'mmw/workflow/engine/lifecycle_manager.py', 'rapid_insight_cli.py', 'mmw/services/infrastructure/hbs.py', 'mmw/tasks/workflow.py', 'mmw/core/config.py', 'mmw/core/bootstrap.py', 'mmw/services/infrastructure/csms.py', 'mmw/services/infrastructure/gwo_state.py', 'mmw/db/models/', 'mmw/db/converters.py', 'mmw/api/v1/endpoints/', 'rapid_insight_cli.py', 'mmw/containers.py', 'mmw/core/bootstrap.py']

def get_file_language(file_path):
    """Get the appropriate language identifier for code blocks based on file extension"""
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    return ext[1:] if len(ext) > 0 else ext

def should_ignore_file(file_path, relative_path):
    """Check if a file should be ignored based on the ignores list"""
    # Check if any ignore pattern matches the file path
    for ignore_pattern in ignores:
        if ignore_pattern in relative_path or ignore_pattern in file_path:
            return True
    return False

def should_keep_file(file_path, relative_path):
    """Check if a file should be kept based on the keeps list"""
    # If keeps list is empty, keep all files (no filtering)
    if not keeps:
        return True
    
    # Check if any keep pattern matches the file path
    for keep_pattern in keeps:
        if keep_pattern in relative_path or keep_pattern in file_path:
            return True
    return False

def convert_folder_to_markdown(folder_path, markdown_file, extends):
    with open(markdown_file, 'w') as md_file:
        # Write the title of the markdown
        md_file.write(f"# Folder Structure of {folder_path}\n\n")

        # Walk through the directory
        for root, dirs, files in os.walk(folder_path):
            # Filter out __pycache__ directories
            dirs[:] = [d for d in dirs if d != '__pycache__']
            
            # Write the directory structure
            level = root.replace(folder_path, '').count(os.sep)
            indent = ' ' * 4 * (level)
            md_file.write(f"{indent}## {os.path.basename(root)}\n")

            # Write the files in the directory
            if files:
                for file in files:
                    md_file.write(f"{indent} - {file}\n")
            md_file.write("\n")

            # Process each file and include its content (optional)
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, folder_path)
                
                # Check if file should be ignored
                if should_ignore_file(file_path, relative_path):
                    continue
                
                # Check if file should be kept (if keeps list is not empty)
                if not should_keep_file(file_path, relative_path):
                    continue
                
                language = get_file_language(file_path)
                if 'venv/' in file_path or '__pycache__' in file_path:
                   continue
                
                if extends != 'all' and language not in extends.split(','):
                   continue
                try:
                    with open(file_path, 'r', encoding='utf-8') as content_file:
                        content = content_file.read()
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```{language}\n{content}\n```\n\n")
                except UnicodeDecodeError:
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```txt\n[Binary file or unsupported encoding - content not displayed]\n```\n\n")
                except Exception as e:
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```txt\n[Error reading file: {str(e)}]\n```\n\n")


# # Example usage:
# folder_path = sys.argv[1]
# markdown_file = sys.argv[2] + '.md'
# if len(sys.argv) > 3:
#     extends = sys.argv[3]
# else:
#     extends = 'python'

convert_folder_to_markdown('/Users/ann/Documents/projects/MM-Agent/web/src', 'code4.md', 'js,ts,tsx')
# convert_folder_to_markdown('/Users/ann/Documents/projects/MMAgent/_minimal/langchain/langgraph_doc_mini', '/Users/ann/Documents/projects/MMAgent/_minimal/langchain/doc.md', 'md')

# convert_folder_to_markdown('/Users/ann/Documents/projects/langgraph/docs/docs', '/Users/ann/Documents/projects/MMAgent/_minimal/langchain/doc.md', 'md')
