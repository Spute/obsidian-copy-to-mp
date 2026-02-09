import win32clipboard
import win32con
import time

def set_clipboard_html(html: str):
    """
    将 HTML 内容复制到剪贴板，方便在公众号测试。
    :param html: 要复制的 HTML 字符串
    """
    try:
        # 打开剪贴板（重试机制，避免被占用）
        for _ in range(5):
            try:
                win32clipboard.OpenClipboard()
                break
            except Exception:
                time.sleep(0.1)
        else:
            print("无法打开剪贴板")
            return

        win32clipboard.EmptyClipboard()

        # Windows HTML clipboard 格式头
        cf_html = f"""Version:0.9
StartHTML:00000097
EndHTML:{97 + len(html) + 69:0>8}
StartFragment:00000131
EndFragment:{134 + len(html):0>8}
<html>
<body>
<!--StartFragment-->
{html}
<!--EndFragment-->
</body>
</html>
"""

        # 设置 HTML 格式
        html_format = win32clipboard.RegisterClipboardFormat("HTML Format")
        win32clipboard.SetClipboardData(html_format, cf_html.encode('utf-8'))

        # 设置纯文本（HTML 源码）
        win32clipboard.SetClipboardData(win32con.CF_UNICODETEXT, html)

        print("HTML 已成功复制到剪贴板！")
    except Exception as e:
        print("复制失败:", e)
    finally:
        try:
            win32clipboard.CloseClipboard()
        except Exception:
            pass

if __name__ == "__main__":
    sample_html = """
<li style="margin: 8px 0px; padding: 0px; box-sizing: border-box; line-height: 1.8 !important;"><strong
        style="; font-weight: 600; color: #2c3e50 !important;"><span leaf="">AI 是杠杆，而非替代</span></strong>
    <section><span leaf="">：它极大地放大了个人开发者的能力，但核心仍在于你的想法与决策；</span></section>
</li>
<li style="margin: 8px 0px; padding: 0px; box-sizing: border-box; line-height: 1.8 !important;">
    <p><strong style="; font-weight: 600; color: #2c3e50 !important;"><span leaf="">AI 是杠杆，而非替代</span></strong>
    <section><span leaf="">：它极大地放大了个人开发者的能力，但核心仍在于你的想法与决策；</span></section>
    <p>
</li>
<li style="margin: 8px 0px; padding: 0px; box-sizing: border-box; line-height: 1.8 !important;">
    <p><strong style="; font-weight: 600; color: #2c3e50 !important;"><span leaf="">AI 是杠杆，而非替代</span></strong>
    <span leaf="">：它极大地放大了个人开发者的能力，但核心仍在于你的想法与决策；</span>
    <p>
</li>
<li style="margin: 8px 0px; padding: 0px; box-sizing: border-box; line-height: 1.8 !important;">
    <strong style="; font-weight: 600; color: #2c3e50 !important;"><span leaf="">AI 是杠杆，而非替代</span></strong>
    <span leaf="">：它极大地放大了个人开发者的能力，但核心仍在于你的想法与决策；</span>
</li>
"""
    set_clipboard_html(sample_html)